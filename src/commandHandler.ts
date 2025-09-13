import { exit } from "process";
import { Config, readConfig, setUser } from "./config";
import { createUser, getUserByName, getUsers, resetUsersTable } from "./lib/db/queries/users";
import { fetchFeed } from "./fetchFeed";
import { createFeed, getFeedByUrl, getFeeds } from "./lib/db/queries/feeds";
import { getCurrentUser, printFeed } from "./utils";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows";

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
    const config: Config = readConfig();
    const currentUser = config.currentUserName;

    const users = await getUsers();
    if (users.length === 0) {
        console.log("No users found.");
        return;
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

    const currentUser = await getCurrentUser();

    // Create and print the feed
    const newFeed = await createFeed(feedName, feedUrl, currentUser.id);
    printFeed(newFeed, currentUser);

    // Auto-follow feed
    await handlerFollow("follow", newFeed.url);
}

export async function handlerFeeds(): Promise<void> {
    const feeds = await getFeeds();
    if (feeds.length === 0) {
        console.log("No feeds found.");
        return;
    }

    for (const feed of feeds) {
        console.log(`Feed Name: ${feed.name}\nFeed URL:  ${feed.url}\nUsername:  ${feed.username}\n`);
    }
}

export async function handlerFollow(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        console.error("Error: Please provide only a feed url.");
        exit(1);
    }
    // Check that feed has been added first
    const feedUrl = args[0];
    const currentFeed = await getFeedByUrl(feedUrl);
    if (!currentFeed) {
        console.error("Error: Feed must be added before following.");
        exit(1);
    }
    const currentUser = await getCurrentUser();

    const result = await createFeedFollow(currentUser.id, currentFeed.id);
    console.log(`User "${result.user_name}" is now following feed "${result.feed_name}".`);
}

export async function handlerFollowing(): Promise<void> {
    const currentUser = await getCurrentUser();
    const follows = await getFeedFollowsForUser(currentUser.id);
    if (follows.length === 0) {
        console.log(`User ${currentUser.name} is not following any feeds.`);
        return;
    }

    console.log(`${currentUser.name} is currently following:`);
    for (const row of follows) {
        console.log(row.feed_name);
    }
}
