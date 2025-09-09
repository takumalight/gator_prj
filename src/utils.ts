import { feeds, users } from "./lib/db/schema";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export function printFeed(feed: Feed, user: User): void {
  console.log(`Feed:
  id: ${feed.id}
  name: ${feed.name}
  url: ${feed.url}
  user_id: ${feed.user_id}
  created_at: ${feed.createdAt}
  updated_at: ${feed.updatedAt}`);

  console.log(`User:
  id: ${user.id}
  name: ${user.name}`);
}