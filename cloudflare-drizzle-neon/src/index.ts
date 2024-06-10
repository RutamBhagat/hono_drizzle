import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users, blogs } from './db/schema';
import { Hono } from 'hono';
import { hashPassword } from './hash';
import { decode, sign, verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/api/v1/user/signup', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const body = await c.req.json();
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
      exp: Math.floor(Date.now() / 1000) + 60 * 30, // Token expires in 30 minutes
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

app.post('/api/v1/user/signin', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const body = await c.req.json();

    const [user] = await db.select().from(users).where(eq(users.username, body.username)).limit(1).execute();
    if (!user) {
      c.status(403);
      return c.json({ error: 'Unauthorized' });
    }

    const payload = {
      sub: body.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 30, // Token expires in 30 minutes
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

app.post('/api/v1/blog', async (c) => {
  return c.text('Hello World');
});

app.put('/api/v1/blog', async (c) => {
  return c.text('Hello World');
});

app.get('/api/v1/blog', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const result = await db.select().from(blogs);
    return c.json({
      result,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});

app.get('/api/v1/blog/blog', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const result = await db.select().from(blogs);
    return c.json({
      result,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});

export default app;
