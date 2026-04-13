import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {}

main();
