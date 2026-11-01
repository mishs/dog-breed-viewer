import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { favourites } from "../../db/schema.js";

const isUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const readBody = async (req: Request): Promise<Record<string, unknown>> => {
  try {
    return await req.json();
  } catch {
    return {};
  }
};

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(favourites).orderBy(desc(favourites.createdAt));
      return Response.json(
        rows.map((row) => ({
          id: row.id,
          image_url: row.imageUrl,
          breed: row.breed,
          created_at: row.createdAt.toISOString(),
        }))
      );
    }

    if (req.method === "POST") {
      const { imageUrl, breed } = await readBody(req);
      if (!isUrl(imageUrl) || typeof breed !== "string" || breed.length === 0) {
        return Response.json({ error: "imageUrl must be a URL and breed is required" }, { status: 400 });
      }
      const inserted = await db
        .insert(favourites)
        .values({ imageUrl, breed })
        .onConflictDoNothing()
        .returning();
      if (inserted.length === 0) {
        return Response.json({ error: "Image is already a favourite" }, { status: 409 });
      }
      return Response.json({ message: "Favourite added" }, { status: 201 });
    }

    if (req.method === "DELETE") {
      const { imageUrl } = await readBody(req);
      if (!isUrl(imageUrl)) {
        return Response.json({ error: "imageUrl must be a URL" }, { status: 400 });
      }
      const removed = await db.delete(favourites).where(eq(favourites.imageUrl, imageUrl)).returning();
      if (removed.length === 0) {
        return Response.json({ error: "Favourite not found" }, { status: 404 });
      }
      return Response.json({ message: "Favourite removed" });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Favourites request failed" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/favourites",
};
