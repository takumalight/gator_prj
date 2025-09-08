import { exit } from "process";
import { CommandHandler } from "./commandHandler"

export type CommandsRegistry = Record<string, CommandHandler>;

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (!(cmdName in registry)) {
        console.error("Unrecognized Command. Please try again.");
        exit(1);
    }
    await registry[cmdName](cmdName, ...args);
}