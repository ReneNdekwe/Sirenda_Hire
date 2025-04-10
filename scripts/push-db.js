#!/usr/bin/env node
const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const { migrate } = require("drizzle-orm/neon-http/migrator");
const path = require("path");

// Read environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Connect to database and run migrations
async function main() {
  console.log("Connecting to database...");
  
  try {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);
    
    console.log("Running migrations...");
    
    await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

main();