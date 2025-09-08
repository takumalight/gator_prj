import { handlerAgg, handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./commandHandler";
import { CommandsRegistry, registerCommand, runCommand } from "./commandsRegistry";
import { argv, exit } from "process";
import { conn } from "./lib/db";

async function main() {
    // Setup registry
    // --- Begin Debug ---
    // console.log("main() is registering commands...");
    // --- End Debug ---
    const commandsRegistry: CommandsRegistry = {};
    registerCommand(commandsRegistry, "login", handlerLogin);
    registerCommand(commandsRegistry, "register", handlerRegister);
    registerCommand(commandsRegistry, "reset", handlerReset);
    registerCommand(commandsRegistry, "users", handlerUsers);
    registerCommand(commandsRegistry, "agg", handlerAgg);

    // Get command and arguments from input
    const input = argv.slice(2);
    if (input.length === 0) {
        console.error("No command provided. Please try again.");
        exit(1);
    }
    const [cmdName, ...args]: string[] = input;
    // --- Begin Debug ---
    // console.log(`main() is about to run runCommand() with cmdName "${cmdName}"...`)
    // --- End Debug ---
    await runCommand(commandsRegistry, cmdName, ...args);

    // --- Begin Debug ---
    // console.log("main() is about to end database connection...");
    // --- End Debug ---
    await conn.end();

    // --- Begin Debug ---
    // console.log("main() is about to process.exit(0)...");
    // --- End Debug ---
    process.exit(0);
}

await main();
