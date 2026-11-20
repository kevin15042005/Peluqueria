import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "PELUQUERIA",
  waitForConnections: true,
  connectionLimit: 10,
  // Fechas como texto "YYYY-MM-DD" (el frontend las compara así)
  dateStrings: true,
  timezone: "local",
});

/**
 * Ejecuta un procedimiento almacenado y devuelve el primer conjunto de filas.
 * Ej: await callProc("OBTENER_SERVICIO") -> [{ID, NOMBRE, ...}]
 */
export async function callProc(nombre, params = []) {
  const marcadores = params.map(() => "?").join(", ");
  const [resultado] = await pool.query(`CALL ${nombre}(${marcadores})`, params);
  // CALL devuelve [filas, OkPacket]; si no hay SELECT devuelve solo OkPacket
  return Array.isArray(resultado) && Array.isArray(resultado[0]) ? resultado[0] : [];
}

/** Ejecuta una consulta SQL normal y devuelve las filas. */
export async function query(sql, params = []) {
  const [filas] = await pool.query(sql, params);
  return filas;
}
