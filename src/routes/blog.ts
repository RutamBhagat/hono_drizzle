import { Hono } from 'hono';
import { asc, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { blogs } from '../db/schema';
import { verify } from 'hono/jwt';
import { postBlogInput, updateBlogInput } from '../zod/blog';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

export const blogRouter = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

blogRouter.use('/*', async (c, next) => {
  const authHeader = c.req.raw.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const payload = await verify(token, c.env.JWT_SECRET_KEY);
  console.log('payload', payload);
  if (!payload) {
    c.status(403);
    return c.json({ error: 'Unauthorized' });
  }
  c.set('userId', payload.sub);
  await next();
});

blogRouter.post('/', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const authorID = parseInt(c.get('userId'));
    const body = await c.req.json();
    const { success } = postBlogInput.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({ error: 'Invalid input' });
    }

    const [blog] = await db
      .insert(blogs)
      .values({
        title: body.title,
        content: body.content,
        authorID: authorID,
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
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({ error: 'Invalid input' });
    }

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

blogRouter.get('/pagination', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const cursor = parseInt(c.req.query('cursor') || '0');
    const limit = parseInt(c.req.query('limit') || '10');

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

blogRouter.get('/seed', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);

    const seedData = [
      {
        title: 'The Impact of Climate Change on Agriculture',
        content: 'Exploring the potential consequences of climate change on global food production and security.',
        published: true,
        authorID: 1,
      },
      {
        title: 'The Role of Artificial Intelligence in Healthcare',
        content:
          'Analyzing the benefits and challenges of using AI in healthcare, and its potential to improve patient outcomes and reduce costs.',
        published: true,
        authorID: 3,
      },
      {
        title: 'The Future of Renewable Energy Sources',
        content:
          'Exploring the growth and potential of renewable energy sources such as solar, wind, and hydro, and their impact on the energy sector and the environment.',
        published: true,
        authorID: 6,
      },
      {
        title: 'The Impact of Social Media on Mental Health',
        content:
          'Exploring the potential benefits and risks of social media use on mental health, and strategies for promoting positive online experiences.',
        published: true,
        authorID: 3,
      },
      {
        title: 'The Evolution of Remote Learning',
        content:
          'Analyzing the growth and transformation of remote learning, and its impact on traditional education models and student outcomes.',
        published: true,
        authorID: 4,
      },
      {
        title: 'The Role of Blockchain in Supply Chain Management',
        content:
          'Exploring the benefits and challenges of using blockchain technology in supply chain management, and its potential to improve transparency, security, and efficiency.',
        published: true,
        authorID: 6,
      },
      {
        title: 'The Impact of Automation on Jobs and Labor Markets',
        content:
          'Analyzing the potential consequences of automation on jobs and labor markets, and strategies for addressing skills gaps and promoting economic opportunity.',
        published: true,
        authorID: 5,
      },
      {
        title: 'The Future of Space Tourism',
        content:
          'Exploring the possibilities and challenges of space tourism, and its potential benefits and risks for the space industry and the public.',
        published: true,
        authorID: 1,
      },
      {
        title: 'The Role of Genetic Engineering in Agriculture',
        content:
          'Analyzing the benefits and ethical implications of using genetic engineering in agriculture, and strategies for promoting sustainable and equitable food systems.',
        published: true,
        authorID: 3,
      },
      {
        title: 'The Impact of Virtual Reality on Education',
        content:
          'Exploring the potential benefits and challenges of using virtual reality in education, and strategies for promoting immersive and engaging learning experiences.',
        published: true,
        authorID: 4,
      },
      {
        title: 'The Future of Autonomous Vehicles',
        content:
          'Analyzing the growth and potential of autonomous vehicles, and their impact on transportation, mobility, and urban planning.',
        published: true,
        authorID: 5,
      },
      {
        title: 'The Role of Big Data in Public Policy',
        content:
          'Exploring the benefits and challenges of using big data in public policy, and strategies for promoting transparency, accountability, and evidence-based decision-making.',
        published: true,
        authorID: 4,
      },
      {
        title: 'The Impact of Social Media on Political Campaigns',
        content:
          'Analyzing the role of social media in political campaigns, and its impact on voter engagement, information dissemination, and campaign finance.',
        published: true,
        authorID: 1,
      },
      {
        title: 'The Future of Nanotechnology',
        content:
          'Exploring the possibilities and challenges of nanotechnology, and its potential applications in medicine, energy, and materials science.',
        published: true,
        authorID: 6,
      },
      {
        title: 'The Role of Robotics in Manufacturing',
        content:
          'Analyzing the benefits and challenges of using robotics in manufacturing, and strategies for promoting productivity, flexibility, and worker safety.',
        published: true,
        authorID: 3,
      },
      {
        title: 'The Impact of Gaming on Cognitive Development',
        content:
          'Exploring the potential benefits and risks of gaming on cognitive development, and strategies for promoting positive and educational gaming experiences.',
        published: true,
        authorID: 4,
      },
      {
        title: 'The Future of 3D Printing',
        content: 'Analyzing the growth and potential of 3D printing, and its impact on manufacturing, healthcare, and design.',
        published: true,
        authorID: 6,
      },
      {
        title: 'The Role of Artificial Intelligence in Finance',
        content:
          'Exploring the benefits and challenges of using AI in finance, and its potential to improve risk management, fraud detection, and customer service.',
        published: true,
        authorID: 5,
      },
      {
        title: 'The Impact of Social Media on Social Movements',
        content: 'Analyzing the role of social media in social movements, and its impact on activism, mobilization, and political change.',
        published: true,
        authorID: 3,
      },
      {
        title: 'The Future of Quantum Computing',
        content:
          'Exploring the possibilities and challenges of quantum computing, and its potential applications in cryptography, optimization, and simulation.',
        published: true,
        authorID: 1,
      },
    ];

    const insertedBlogs = await db.insert(blogs).values(seedData).returning();

    return c.json({ insertedBlogs });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});

blogRouter.get('/:blogID', async (c) => {
  try {
    const client = new Pool({ connectionString: c.env.DATABASE_URL });
    const db = drizzle(client);
    const blogID = parseInt(c.req.param('blogID'), 10);

    const [blog] = await db.select().from(blogs).where(eq(blogs.id, blogID)).limit(1).execute();

    return c.json({
      blog,
    });
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ error });
  }
});
