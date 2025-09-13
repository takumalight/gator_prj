import { exit } from "process";
import { feeds, users } from "./lib/db/schema";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";

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

export async function getCurrentUser() {
  const config = readConfig();
  const currentUser = config.currentUserName;
  if(!currentUser) {
      console.error("Must register and login as a user first.");
      exit(1);
  }

  const retrievedUser = await getUserByName(currentUser);
  if (!retrievedUser) {
      console.error("Error: user not found.");
      exit(1);
  }
  return retrievedUser;
}
