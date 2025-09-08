import { Sequelize } from "sequelize";
import type {Options} from "sequelize"
import config from "./config.js";

const env = (process.env.NODE_ENV as "development" | "test" | "production") || "development";
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Database configuration for environment "${env}" not found.`);
}

// 1. Create a new options object that strictly matches what Sequelize expects.
const sequelizeOptions: Options = {
  username: dbConfig.username,
  database: dbConfig.database,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
};

// 2. Conditionally add each optional property to the object ONLY if it exists.
//    This prevents keys with `undefined` values from ever being added.
if (dbConfig.password) {
  sequelizeOptions.password = dbConfig.password;
}
if (dbConfig.dialectOptions) {
  sequelizeOptions.dialectOptions = dbConfig.dialectOptions;
}
if (dbConfig.pool) {
  sequelizeOptions.pool = dbConfig.pool;
}

// 3. Pass the clean, guaranteed-to-be-correct options object to the constructor.
const sequelize = new Sequelize(sequelizeOptions);


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
