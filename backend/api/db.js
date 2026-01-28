// api/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Crear pool global
let pool = null;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10, // Máximo 10 conexiones simultáneas
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000, // Mantener conexiones vivas
      timezone: 'local',
      charset: 'utf8mb4',
    });
    
    console.log("✅ Pool de conexiones MySQL creado");
  }
  return pool;
};

// Función para obtener una conexión del pool
const conectDb = async () => {
  try {
    if (!pool) {
      createPool();
    }
    
    // Obtener conexión del pool
    const connection = await pool.getConnection();
    
    // Configurar manejo de errores para esta conexión
    connection.on('error', (err) => {
      console.error('❌ Error en conexión MySQL:', err);
      // No lanzar error, dejar que el pool maneje la reconexión
    });
    
    // Devolver conexión con promesa de liberarla después de usar
    return {
      ...connection,
      // Sobrescribir el método execute para liberar automáticamente
      execute: async (sql, params) => {
        try {
          const result = await connection.execute(sql, params);
          return result;
        } catch (error) {
          throw error;
        } finally {
          connection.release(); // Importante: liberar conexión después de usar
        }
      },
      // Sobrescribir query también
      query: async (sql, params) => {
        try {
          const result = await connection.query(sql, params);
          return result;
        } catch (error) {
          throw error;
        } finally {
          connection.release();
        }
      }
    };
    
  } catch (err) {
    console.error("❌ Error al obtener conexión de pool:", err);
    
    // Intentar recrear el pool si hay error crítico
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || 
        err.code === 'ECONNREFUSED' || 
        err.code === 'ER_CON_COUNT_ERROR') {
      console.log("🔄 Intentando recrear pool de conexiones...");
      pool = null;
      return await conectDb(); // Recursivo
    }
    
    throw err;
  }
};

// Función para cerrar el pool (útil para shutdown)
const closePool = async () => {
  if (pool) {
    try {
      await pool.end();
      console.log("✅ Pool de conexiones cerrado correctamente");
    } catch (err) {
      console.error("❌ Error al cerrar pool:", err);
    }
    pool = null;
  }
};

// Middleware para manejar conexiones en rutas
const withConnection = (handler) => {
  return async (req, res, next) => {
    let connection;
    try {
      connection = await conectDb();
      req.db = connection;
      await handler(req, res, next);
    } catch (error) {
      console.error('❌ Error en handler con conexión DB:', error);
      next(error);
    } finally {
      // No necesitamos liberar aquí porque se libera automáticamente en execute/query
    }
  };
};

export { conectDb, closePool, withConnection };
export default conectDb;