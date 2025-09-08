import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export async function createUser(name: string) {
    // --- Begin Debug ---
    // console.log(`Running createUser() with "${name}"...`);
    // --- End Debug ---
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUserByName(name: string) {
    // --- Begin Debug ---
    // console.log(`Running getUserByName() with "${name}"...`);
    // --- End Debug ---
    try {
        const [result] = await db.select().from(users).where(eq(users.name, name));
        return result;
    } catch (error) {
        console.error("getUserByName() encountered an error...");
        throw error; // Re-throw the error so the calling function can handle it
    }
}

export async function resetUsersTable() {
    await db.delete(users);
}

export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}