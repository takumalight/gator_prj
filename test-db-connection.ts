import postgres from "postgres";
import { readConfig } from "./src/config"; // Adjust path if necessary

async function testConnection() {
    console.log("Attempting to connect directly with postgres-js...");
    const config = readConfig();
    const dbUrl = config.dbUrl;
    console.log("DB URL:", dbUrl);

    let sql;
    try {
        sql = postgres(dbUrl); // Establish connection

        console.log("Connection established. Running simple query...");
        const result = await sql`SELECT 1 as test_column`; // Run a simple query
        console.log("Query result:", result);
        console.log("Test column value:", result[0].test_column);

        console.log("Test successful!");
    } catch (error) {
        console.error("Error during direct postgres-js connection test:", error);
    } finally {
        if (sql) {
            console.log("Ending connection.");
            await sql.end(); // Close connection
        }
    }
}

testConnection();