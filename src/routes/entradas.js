import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, competencia_id, data, tipo_renda, descricao, valor } = req.body;

  const { rows } = await pool.query(
    `insert into entradas 
     (user_id, competencia_id, data, tipo_renda, descricao, valor)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [user_id, competencia_id, data, tipo_renda, descricao, valor]
  );

  res.json(rows[0]);
});

router.get("/:competencia_id", async (req, res) => {
  const { competencia_id } = req.params;

  const { rows } = await pool.query(
    `select * from entradas
     where competencia_id=$1 and deleted=''`,
    [competencia_id]
  );
  res.json(rows);
});

// PATCH dinâmico: recebe { campo, valor }
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const allowed = {
    data: 'data',
    tipo_renda: 'tipo_renda',
    descricao: 'descricao',
    valor: 'valor'
  };

  const coluna = allowed[campo];
  if (!coluna) {
    return res.status(400).json({ error: 'Campo inválido. Use um de: data, tipo_renda, descricao, valor' });
  }

  try {
    const { rows } = await pool.query(
      `update entradas set ${coluna}=$1 where id=$2 and deleted='' returning *`,
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

// DELETE lógico da entrada
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update entradas set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});

export default router;
