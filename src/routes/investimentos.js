import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// POST /investimentos
router.post("/", async (req, res) => {
  const { user_id, competencia_id, data, descricao, valor } = req.body;

  const { rows } = await pool.query(
    `insert into investimentos 
     (user_id, competencia_id, data, descricao, valor)
     values ($1,$2,$3,$4,$5) returning *`,
    [user_id, competencia_id, data, descricao, valor]
  );

  res.json(rows[0]);
});

// GET /investimentos/:competencia_id
router.get("/:competencia_id", async (req, res) => {
  const { competencia_id } = req.params;

  const { rows } = await pool.query(
    `select * from investimentos
     where competencia_id=$1 and deleted=''`,
    [competencia_id]
  );

  res.json(rows);
});

export default router;
