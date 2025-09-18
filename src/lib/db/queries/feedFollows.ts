import { and, eq } from "drizzle-orm";
import { db } from ".."
import { feed_follows, feeds, users } from "../schema"

export async function createFeedFollow(userId: string, feedId: string) {
    const [feedFollow] = await db
        .insert(feed_follows)
        .values({
            user_id: userId,
            feed_id: feedId
        })
        .returning();
    
    const [result] = await db
        .select({
            id: feed_follows.id,
            created_at: feed_follows.createdAt,
            updated_at: feed_follows.updatedAt,
            user_id: feed_follows.user_id,
            user_name: users.name,
            feed_id: feed_follows.feed_id,
            feed_name: feeds.name
        })
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
        .innerJoin(users, eq(feed_follows.user_id, users.id))
        .where(eq(feed_follows.id, feedFollow.id))
    
    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const results = await db
        .select({
            id: feed_follows.id,
            created_at: feed_follows.createdAt,
            updated_at: feed_follows.updatedAt,
            user_id: feed_follows.user_id,
            user_name: users.name,
            feed_id: feed_follows.feed_id,
            feed_name: feeds.name
        })
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
        .innerJoin(users, eq(feed_follows.user_id, users.id))
        .where(eq(feed_follows.user_id, userId));
    return results;
}

export async function unfollowFeedForUser(userId: string, feedId: string) {
    try {
        const [result] = await db
            .delete(feed_follows)
            .where(
                and(
                    eq(feed_follows.user_id, userId),
                    eq(feed_follows.feed_id, feedId)
                )
            )
            .returning();
        return result;
    } catch (error) {
        console.error("unfollowFeedForUser() encountered an error...");
        throw error;
    }
}
