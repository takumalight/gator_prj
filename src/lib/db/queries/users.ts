import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
    try {
        const [result] = await db.insert(users).values({ name: name }).returning();
        return result;
    } catch (error) {
        console.error("createUser encountered an error...");
        throw error;
    }
}

export async function getUserByName(name: string) {
    try {
        const [result] = await db
            .select()
            .from(users)
            .where(eq(users.name, name));
        return result;
    } catch (error) {
        console.error("getUserByName() encountered an error...");
        throw error; // Re-throw the error so the calling function can handle it
    }
}

export async function resetUsersTable() {
    try {
        await db.delete(users);
    } catch (error) {
        console.error("resetUsersTable() encountered an error...")
        throw error;
    }
}

export async function getUsers() {
    try {
        const result = await db.select().from(users);
        return result;
    } catch (error) {
        console.error("getUsers() encountered an error...");
        throw error;
    }
}
