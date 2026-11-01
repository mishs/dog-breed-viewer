import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const favourites = pgTable("favourites", {
  id: serial().primaryKey(),
  imageUrl: text("image_url").notNull().unique(),
  breed: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
