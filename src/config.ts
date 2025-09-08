import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName?: string;
}

export function setUser(username: string): void {
    const currentConfig = readConfig();
    currentConfig.currentUserName = username;
    writeConfig(currentConfig);
}

export function readConfig(): Config {
    const config_content = fs.readFileSync(getConfigFilePath(), {encoding: "utf-8"});
    return validateConfig(config_content);
}

// HELPER FUNCTIONS
export function getConfigFilePath(): string {
    const file_path = path.join(os.homedir(), ".gatorconfig.json");
    return file_path;
}

export function writeConfig(cfg: Config): void {
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(cfg), { encoding: "utf-8" });
}

export function validateConfig(rawConfig: any): Config {
    try{
        const config_json = JSON.parse(rawConfig);

        // Handling camelCase and snake_case
        let resolvedDbURL: string | undefined = config_json.dbUrl;
        if (resolvedDbURL === undefined) {
            resolvedDbURL = config_json.db_url;
        }
        if (!resolvedDbURL || typeof resolvedDbURL !== 'string') {
            throw new Error("Invalid or missing 'db_url'/'dbUrl' property in config file.");
        }
        let resolvedUserName: string | undefined = config_json.currentUserName;
        if (resolvedUserName === undefined) {
            resolvedUserName = config_json.current_user_name;
        }


        return {
            dbUrl: resolvedDbURL,
            currentUserName: resolvedUserName || ''
        } as Config;

    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Config file is malformed jSON. Please check syntax.");
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Unknown error occurred during config validation.");
    }
}
