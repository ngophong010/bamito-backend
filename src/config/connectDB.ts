import { Sequelize } from "sequelize";
import config from "./config.js";

const env = (process.env.NODE_ENV as "development" | "test" | "production") || "development";
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Database configuration for environment "${env}" not found.`);
}

const sequelize = new Sequelize({
    ...dbConfig,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connection to the ${env} database has been established successfully.`);
  } catch (error: unknown) { // ENHANCEMENT 1: Add 'unknown' type
    console.error(`❌ Unable to connect to the ${env} database:`);
    // Use a type guard to safely access error properties
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }
    process.exit(1);
  }
};

export { connectDB };
export default sequelize;
