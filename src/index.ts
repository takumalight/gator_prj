import { handlerAddFeed, handlerAgg, handlerFeeds, handlerFollow, handlerFollowing, handlerLogin, handlerRegister, handlerReset, handlerUnfollow, handlerUsers, middlewareLoggedIn } from "./commandHandler";
import { CommandsRegistry, registerCommand, runCommand } from "./commandsRegistry";
import { argv, exit } from "process";
import { conn } from "./lib/db";

async function main() {
    const commandsRegistry: CommandsRegistry = {};
    registerCommand(commandsRegistry, "login", handlerLogin);
    registerCommand(commandsRegistry, "register", handlerRegister);
    registerCommand(commandsRegistry, "reset", handlerReset);
    registerCommand(commandsRegistry, "users", handlerUsers);
    registerCommand(commandsRegistry, "agg", handlerAgg);
    registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(commandsRegistry, "feeds", handlerFeeds);
    registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow));

    const input = argv.slice(2);
    if (input.length === 0) {
        console.error("No command provided. Please try again.");
        exit(1);
    }
    const [cmdName, ...args]: string[] = input;
    await runCommand(commandsRegistry, cmdName, ...args);

    await conn.end();
    process.exit(0);
}

await main();
