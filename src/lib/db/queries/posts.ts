import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feed_follows, posts } from "../schema";
import { getFeedByUrl } from "./feeds";

export async function createPost(post: RSSItem, feedUrl: string) {
    try {
        const feedMatch = await getFeedByUrl(feedUrl);
        const [result] = await db
            .insert(posts)
            .values({
                title: post.title,
                url: post.link,
                publishedAt: post.pubDate,
                description: post.description,
                feedId: feedMatch.id
            }).returning();

        return result;
    } catch (error) {
        console.error("createPost() encountered an error...");
        throw error;
    }
}

export async function checkPostExists(postUrl: string): Promise<boolean> {
    try {
        const result = await db
            .select()
            .from(posts)
            .where(eq(posts.url, postUrl));
        return result ? true : false;
    } catch (error) {
        console.error("checkPostExists() encountered an error...");
        throw error;
    }
}

export async function getPostsForUser(userId: string, postCount: number) {
    try {
        const results = await db
            .select({
                title: posts.title,
                url: posts.url,
                description: posts.description,
                publishedAt: posts.publishedAt
            })
            .from(posts)
            .innerJoin(feed_follows, eq(posts.feedId, feed_follows.feed_id))
            .where(eq(feed_follows.user_id, userId))
            .orderBy(sql`${posts.publishedAt} DESC`)
            .limit(postCount);
        
        return results;
    } catch (error) {
        console.error("getPostsForUser() encountered an error...");
        throw error;
    }
}
