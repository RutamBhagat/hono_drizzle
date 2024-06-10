import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { blogs } from '../db/schema';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

export const blogRouter = new Hono<{ Bindings: Env }>();

blogRouter.post('/blog', async (c) => {
  return c.text('Hello World');
});

blogRouter.put('/blog', async (c) => {
  return c.text('Hello World');
});

blogRouter.get('/blog', async (c) => {
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

blogRouter.get('/blog/blog', async (c) => {
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
