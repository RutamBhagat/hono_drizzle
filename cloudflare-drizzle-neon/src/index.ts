import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);

export default app;
