import { exit } from "process";
import { readConfig, setUser } from "./config";
import { createUser, getUserByName, getUsers, resetUsersTable } from "./lib/db/queries/users";
import { fetchFeed } from "./fetchFeed";
import { createFeed, getFeeds } from "./lib/db/queries/feeds";
import { printFeed } from "./utils";
import { name } from "drizzle-orm";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {

    // Ensure correct number of arguments
    if (args.length === 0) {
        console.error("Please provide a username to log in.");
        exit(1);
    }else if (args.length > 1) {
        console.error("Usernames cannot contain spaces.");
        exit(1);
    }

    const username = args[0];

    // Make sure username exists
    const existing_user = await getUserByName(username);
    if (existing_user === undefined) {
        console.error(`User with the name "${username}" does not exist.`);
        exit(1);
    }

    setUser(username);
    console.log(`Logged in user ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {

    // Ensure correct number of arguments
    if (args.length === 0) {
        console.error("Please provide a name to register");
        exit(1);
    }else if (args.length > 1) {
        console.error("Name to register cannot contain spaces.");
        exit(1);
    }

    const name_to_register = args[0];

    // Check if name already exists
    const existing_user = await getUserByName(name_to_register);
    if (existing_user !== undefined) {
        console.error(`User with the name "${name_to_register}" already exists.`);
        exit(1);
    }

    // Create the user
    await createUser(name_to_register);

    setUser(name_to_register);
    console.log(`New user "${name_to_register}" registered and logged in.`);
}

export async function handlerReset(): Promise <void> {
    await resetUsersTable();
    console.log("The users table has been reset.");
}

export async function handlerUsers(): Promise <void> {
    const config = readConfig();
    const currentUser = config.currentUserName;

    const users = await getUsers();
    if (users.length === 0) {
        console.error("No users found.");
        exit(1);
    }

    for (const user of users) {
        console.log(`${user.name}${currentUser === user.name ? " (current)": ""}`);
    }
}

export async function handlerAgg(): Promise <void> {
    try {
        console.log(JSON.stringify(await fetchFeed("https://www.wagslane.dev/index.xml")));
    } catch {
        console.error("Aggregate funciton failed.");
    }
}

export async function handlerAddFeed(cmdName: string, ...args: string[]): Promise<void> {
    // Verify correct number of arguments
    if (args.length < 2) {
        console.error("Error: Name and URL for feed are both required.");
        exit(1);
    } else if (args.length > 2) {
        console.error("Error: Too many arguments. Provide only the name (no spaces) and URL for the feed");
        exit(1);
    }

    const feedName = args[0];
    const feedUrl = args[1];

    // Get current user
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

    // Create and print the feed
    const newFeed = await createFeed(feedName, feedUrl, retrievedUser.id);
    printFeed(newFeed, retrievedUser);
}

export async function handlerFeeds(): Promise<void> {
    const feeds = await getFeeds();
    if (feeds.length === 0) {
        console.error("No feeds found.");
        exit(1);
    }

    for (const feed of feeds) {
        console.log(`Feed Name: ${feed.name}\nFeed URL:  ${feed.url}\nUsername:  ${feed.username}\n`);
    }
}
