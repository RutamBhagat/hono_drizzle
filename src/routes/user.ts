import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users } from '../db/schema';
import { hashPassword } from '../hash';
import { signinInput, signupInput } from '../zod/user';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

export const userRouter = new Hono<{ Bindings: Env }>();

userRouter.post('/signup', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({ error: 'Invalid input' });
    }

    const [user] = await db
      .insert(users)
      .values({
        name: body.name,
        username: body.username,
        password: await hashPassword(body.password),
      })
      .returning();

    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 30 * 4, // Token expires in 24 hours
    };
    const secret = c.env.JWT_SECRET_KEY;
    const token = await sign(payload, secret);

    return c.json({
      token,
    });
  } catch (error) {
    c.status(411);
    return c.json({ error: 'User already exists with this username' });
  }
});

userRouter.post('/signin', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({ error: 'Invalid input' });
    }

    const [user] = await db.select().from(users).where(eq(users.username, body.username)).limit(1).execute();
    if (!user) {
      c.status(403);
      return c.json({ error: 'Invalid credentials' });
    }

    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 30 * 4, // Token expires in 24 hours
    };
    const secret = c.env.JWT_SECRET_KEY;
    const token = await sign(payload, secret);

    return c.json({
      token,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});
