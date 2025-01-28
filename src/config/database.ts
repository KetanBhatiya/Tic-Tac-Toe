import { DataSource } from "typeorm";
import { config } from "./env.config";
import { join } from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  synchronize: config.DATABASE_SYNC,
  logging: false,
  entities: [join(__dirname, "../entities/*.ts")],
  migrations: [join(__dirname, "../migration/*.ts")],
});

export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }
};
