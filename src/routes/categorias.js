import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, nome } = req.body;
  const { rows } = await pool.query(
    `insert into categorias (user_id, nome)
     values ($1,$2) returning *`,
    [user_id, nome]
  );
  res.json(rows[0]);
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { rows } = await pool.query(
    `select * from categorias 
     where user_id=$1 and deleted=''
     order by nome`,
    [user_id]
  );
  res.json(rows);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const { rows } = await pool.query(
    `update categorias set nome=$1 where id=$2 returning *`,
    [nome, id]
  );
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update categorias set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});

export default router;
