import { Feed } from "src/utils";
import { db } from "..";
import { feeds, users } from "../schema";
import { eq, sql } from "drizzle-orm";
import { exit } from "process";

export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {
    const [result] = await db
        .insert(feeds)
        .values({
            name: name,
            url: url,
            user_id: userId
        })
        .returning();
    return result;
}

export async function getFeeds() {
    try {
        return await db
            .select({name: feeds.name, url: feeds.url, username: users.name, lastFetchedAt: feeds.lastFetchedAt})
            .from(feeds)
            .innerJoin(users, eq(feeds.user_id, users.id));
    } catch (error) {
        console.error("getFeeds() encountered an error...");
        throw error;
    }
}

export async function getFeedByUrl(url: string) {
    try {
        const [result] = await db
            .select()
            .from(feeds)
            .where(eq(feeds.url, url));
        return result;
    } catch (error) {
        console.error("getFeedByUrl() encountered an error...");
        throw error;
    }
}

export async function markFeedFetched(feedId: string) {
    try {
        await db
        .update(feeds)
        .set({ lastFetchedAt: sql`NOW()`, updatedAt: sql`NOW()` })
        .where(eq(feeds.id, feedId))

    } catch (error) {
        console.error("markFeedFetched() encountered an error...");
        throw error;
    }
}

export async function getNextFeedToFetch(): Promise<Feed> {
    try {
        const result = await db
            .select()
            .from(feeds)
            .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`);

        /* console.log("/////");
        console.log(result);
        console.log("/////"); */
        return result[0];
    } catch (error) {
        console.error("getNextFeedToFetch() encountered an error...");
        throw error;
    }
}
