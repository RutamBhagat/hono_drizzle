import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { userRouter } from './routes/user';
import { users, blogs } from './db/schema';
import { hashPassword } from './hash';
import { decode, sign, verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { blogRouter } from './routes/blog';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);

export default app;
