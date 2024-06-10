import { Hono } from 'hono';
import { asc, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { blogs } from '../db/schema';
import { verify } from 'hono/jwt';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

export const blogRouter = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

blogRouter.use('/*', async (c, next) => {
  const authHeader = c.req.raw.headers.get('Authorization') || '';
  const user = await verify(authHeader, c.env.JWT_SECRET_KEY);
  if (!user) {
    c.status(403);
    return c.json({ error: 'Unauthorized' });
  }
  c.set('userId', user.id);
  next();
});

blogRouter.post('/', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const body = await c.req.json();
    const authorId = parseInt(c.get('userId'));

    const [blog] = await db
      .insert(blogs)
      .values({
        title: body.title,
        content: body.content,
        authorID: authorId,
        published: body.published,
      })
      .returning();

    return c.json({
      blog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});

blogRouter.put('/', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const body = await c.req.json();

    const [blog] = await db
      .update(blogs)
      .set({
        title: body.title,
        content: body.content,
        published: body.published,
      })
      .where(eq(blogs.id, body.id))
      .returning();

    return c.json({
      blog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});

blogRouter.get('/blogs-with-pagination', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const cursor = parseInt(c.req.query('cursor') as string, 10) || undefined;
    const limit = parseInt(c.req.query('limit') as string, 10) || 10;

    const allBlogs = await db
      .select()
      .from(blogs)
      .where(cursor ? gt(blogs.id, cursor) : undefined)
      .limit(limit)
      .orderBy(asc(blogs.id));

    return c.json({
      blogs: allBlogs,
      cursor: allBlogs.length > 0 ? allBlogs[allBlogs.length - 1].id : undefined,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});

blogRouter.get('/:blogId', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const blogId = parseInt(c.req.param('blogId'), 10);

    const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogId)).limit(1).execute();

    return c.json({
      blog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});
