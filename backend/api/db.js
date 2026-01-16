import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const conectDb = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10, // Máximo 10 conexiones simultáneas
      queueLimit: 0,
    });
    return connection;
  } catch (err) {
    console.error("Error DB:", err);
    throw err;
  }
};

export default conectDb;
