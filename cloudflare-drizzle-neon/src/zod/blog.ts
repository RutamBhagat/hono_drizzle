import { z } from 'zod';

export const postBlogInput = z.object({
  title: z.string().min(3).max(20),
  content: z.string().min(10).max(2000),
  authorID: z.number().positive(),
  published: z.boolean(),
});

export type TPostBlogInput = z.infer<typeof postBlogInput>;

export const updateBlogInput = z.object({
  title: z.string().min(3).max(20),
  content: z.string().min(10).max(2000),
  published: z.boolean(),
});

export type TUpdateBlogInput = z.infer<typeof updateBlogInput>;
