CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"username" text,
	"password" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "products" RENAME TO "blogs";--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "published" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "authorID" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorID_users_id_fk" FOREIGN KEY ("authorID") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "price";