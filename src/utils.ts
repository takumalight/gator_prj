import { exit } from "process";
import { feeds, users } from "./lib/db/schema";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { fetchFeed } from "./fetchFeed";
import { checkPostExists, createPost } from "./lib/db/queries/posts";

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

export async function scrapeFeeds() {
  const nextFeed = await getNextFeedToFetch();
  await markFeedFetched(nextFeed.id);
  const feedData = await fetchFeed(nextFeed.url);
  
  console.log(feedData.channel.title);
  console.log(feedData.channel.link);
  console.log(feedData.channel.description);
  for (const post of feedData.channel.item) {
    if(await checkPostExists(post.link)) {
      console.log(`${post.title} already stored. Continuing...`);
      continue;
    }
    const result = await createPost(post, nextFeed.url);
    console.log(`Saved Post ${result.title}`);
  }
  console.log('==========');
}

export function convertToMs(count: number, interval: string) {
  switch (interval) {
    case 'h':
      return count * 1000 * 60 * 60;
    case 'm':
      return count * 1000 * 60;
    case 's':
      return count * 1000;
    case 'ms':
    default:
      return count;
  }
}
