import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    user_id, competencia_id, categoria_id,
    forma_pagamento_id, data, descricao, valor
  } = req.body;

  const { rows } = await pool.query(
    `insert into gastos_variaveis 
    (user_id, competencia_id, categoria_id, forma_pagamento_id, data, descricao, valor)
    values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [
      user_id, competencia_id, categoria_id,
      forma_pagamento_id, data, descricao, valor
    ]
  );

  res.json(rows[0]);
});

router.get("/:competencia_id", async (req, res) => {
  const { competencia_id } = req.params;
  const { rows } = await pool.query(
    `select * from gastos_variaveis
     where competencia_id=$1 and deleted=''`,
    [competencia_id]
  );
  res.json(rows);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, descricao, valor } = req.body;
  const { rows } = await pool.query(
    `update gastos_variaveis 
     set data=$1, descricao=$2, valor=$3
     where id=$4 returning *`,
    [data, descricao, valor, id]
  );
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update gastos_variaveis set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});

export default router;
