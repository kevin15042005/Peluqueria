import express from "express";
import conectDb from "../db.js";

const router = express.Router(0);


//Obtener Servicos 

router.get("/servicios/:empeladosId", async(req,res)=>{
    try {
        const db = await conectDb
        const [rows] = await db.conectDb("CALL OBETNER_SERVICIOS_EMPELADOS(?)"),
        res.json(rows[0])
    } catch (error) {
        
    }
})