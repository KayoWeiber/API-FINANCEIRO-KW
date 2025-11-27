import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, tipo } = req.body;
  const { rows } = await pool.query(
    `insert into formas_pagamento (user_id, tipo)
     values ($1,$2) returning *`,
    [user_id, tipo]
  );
  res.json(rows[0]);
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { rows } = await pool.query(
    `select * from formas_pagamento 
     where user_id=$1 and deleted=''`,
    [user_id]
  );
  res.json(rows);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;
  const { rows } = await pool.query(
    `update formas_pagamento set tipo=$1 where id=$2 returning *`,
    [tipo, id]
  );
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update formas_pagamento set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});

export default router;
