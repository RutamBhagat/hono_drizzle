import { pgTable, serial, text, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  username: text('username').unique(),
  password: text('password'),
});

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  content: text('content'),
  title: text('title'),
  published: boolean('published').default(false),
  authorID: integer('authorID').references(() => users.id),
});
