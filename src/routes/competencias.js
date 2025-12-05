import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, ano, mes, ativa } = req.body;
  const { rows } = await pool.query(
    `insert into competencias (user_id, ano, mes, ativa)
     values ($1,$2,$3,$4) returning *`,
    [user_id, ano, mes, ativa]
  );
  res.json(rows[0]);
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { rows } = await pool.query(
    `select * from competencias 
     where user_id=$1 and deleted=''
     order by ano desc, mes desc`,
    [user_id]
  );
  res.json(rows);
});
router.patch("/ativar", async (req, res) => {
  const { user_id, ano, mes, ativa } = req.body;
  if (!user_id || !ano || !mes) {
    return res.status(400).json({ error: "Informe user_id, ano e mes" });
  }
  const flag = typeof ativa === 'boolean' ? ativa : true;
  try {
    const { rows } = await pool.query(
      `update competencias
       set ativa=$4
       where user_id=$1 and ano=$2 and mes=$3 and deleted='' returning *`,
      [user_id, ano, mes, flag]
    );
    if (!rows.length) return res.status(404).json({ error: "Competência não encontrada" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { ativa } = req.body;
  const { rows } = await pool.query(
    `update competencias set ativa=$1 where id=$2 returning *`,
    [ativa, id]
  );
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update competencias set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});



export default router;
