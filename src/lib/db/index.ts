import { drizzle } from "drizzle-orm/postgres-js";
import { Logger } from "drizzle-orm";
import postgres from "postgres";

import * as schema from "./schema";
import { readConfig } from "../../config";

// Logger in case debugging is needed
class MyCustomLogger implements Logger {
    logQuery(query: string, params: unknown[]): void {
        console.log("Drizzle Query: ", query);
        if (params.length > 0) {
            console.log("Drizzle Params: ", params);
        }
    }
}

const config = readConfig();
export const conn = postgres(config.dbUrl);

export const db = drizzle(conn, {
    schema,
    // --- Begin Debug ---
    // logger: new MyCustomLogger()
    // --- End Debug ---
});
