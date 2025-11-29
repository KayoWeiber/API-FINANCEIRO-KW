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

// PATCH dinâmico: { campo, valor }
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const allowed = {
    data: 'data',
    descricao: 'descricao',
    valor: 'valor'
  };

  const coluna = allowed[campo];
  if (!coluna) {
    return res.status(400).json({ error: 'Campo inválido. Use um de: data, descricao, valor' });
  }

  try {
    const { rows } = await pool.query(
      `update investimentos set ${coluna}=$1 where id=$2 and deleted='' returning *`,
      [valor, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Registro não encontrado ou deletado' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE lógico
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update investimentos set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});

export default router;
