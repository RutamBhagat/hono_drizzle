import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users, blogs } from './db/schema';
import { Hono } from 'hono';

export type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/api/v1/user/signup', async (c) => {
  return c.text('Hello World');
});

app.post('/api/v1/user/signin', async (c) => {
  return c.text('Hello World');
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
    return c.json(
      {
        error,
      },
      400
    );
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
    return c.json(
      {
        error,
      },
      400
    );
  }
});

export default app;
