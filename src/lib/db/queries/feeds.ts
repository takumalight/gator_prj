import { Feed } from "src/utils";
import { db } from "..";
import { feeds, users } from "../schema";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {
    const [result] = await db.insert(feeds).values({ name: name, url: url, user_id: userId}).returning();
    return result;
}

export async function getFeeds() {
    const result = db.select({name: feeds.name, url: feeds.url, username: users.name}).from(feeds).leftJoin(users, eq(feeds.user_id, users.id));
    return result;
}
