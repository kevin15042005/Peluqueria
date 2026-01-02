import mysql from "mysql2";
import dotenv from "dotenv"

dotenv.config();

const db = mysql.createConnection((
    host:
    user:
    password:
    databse:
    port:
))
db.connect((err)=>{
    if(err){
        console.error("Error al conectar mysql ", err);
        return
    }
    console.log("Concetado a mysql ")
})
export  default db;