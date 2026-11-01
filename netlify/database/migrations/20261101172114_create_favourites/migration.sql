CREATE TABLE "favourites" (
	"id" serial PRIMARY KEY,
	"image_url" text NOT NULL UNIQUE,
	"breed" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
