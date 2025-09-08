"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUser = setUser;
exports.readConfig = readConfig;
exports.getConfigFilePath = getConfigFilePath;
exports.writeConfig = writeConfig;
exports.validateConfig = validateConfig;
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
function setUser(username) {
    var currentConfig = readConfig();
    currentConfig.currentUserName = username;
    writeConfig(currentConfig);
}
function readConfig() {
    var config_content = fs_1.default.readFileSync(getConfigFilePath(), { encoding: "utf-8" });
    return validateConfig(config_content);
}
// HELPER FUNCTIONS
function getConfigFilePath() {
    var file_path = path_1.default.join(os_1.default.homedir(), ".gatorconfig.json");
    return file_path;
}
function writeConfig(cfg) {
    fs_1.default.writeFileSync(getConfigFilePath(), JSON.stringify(cfg), { encoding: "utf-8" });
}
function validateConfig(rawConfig) {
    try {
        var config_json = JSON.parse(rawConfig);
        // Handling camelCase and snake_case
        var resolvedDbURL = config_json.dbUrl;
        if (resolvedDbURL === undefined) {
            resolvedDbURL = config_json.db_url;
        }
        if (!resolvedDbURL || typeof resolvedDbURL !== 'string') {
            throw new Error("Invalid or missing 'db_url'/'dbUrl' property in config file.");
        }
        var resolvedUserName = config_json.currentUserName;
        if (resolvedUserName === undefined) {
            resolvedUserName = config_json.current_user_name;
        }
        return {
            dbUrl: resolvedDbURL,
            currentUserName: resolvedUserName || ''
        };
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Config file is malformed jSON. Please check syntax.");
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Unknown error occurred during config validation.");
    }
}
