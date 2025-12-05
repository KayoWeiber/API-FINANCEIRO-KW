import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// POST /metas-investimentos
router.post("/", async (req, res) => {
  const { user_id, competencia_id, valor_meta } = req.body;

  try {
    const { rows } = await pool.query(
      `insert into metas_investimentos 
       (user_id, competencia_id, valor_meta)
       values ($1,$2,$3) returning *`,
      [user_id, competencia_id, valor_meta]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    // Conflito na constraint unique (user_id, competencia_id)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Meta já existe para essa competência' });
    }
    // Violação de CHECK (valor_meta > 0) ou outros erros de validação
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Valor da meta deve ser maior que 0' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /metas-investimentos/:competencia_id
router.get("/:competencia_id", async (req, res) => {
  const { competencia_id } = req.params;

  try {
    const { rows } = await pool.query(
      `select * from metas_investimentos
       where competencia_id=$1 and deleted=''`,
      [competencia_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH dinâmico para atualizar apenas "valor_meta"
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  // Apenas permitir alteração do valor_meta
  if (campo !== 'valor_meta') {
    return res.status(400).json({ error: 'Campo inválido. Use: valor_meta' });
  }

  try {
    const { rows } = await pool.query(
      `update metas_investimentos set valor_meta=$1
       where id=$2 and deleted='' returning *`,
      [valor, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Registro não encontrado ou deletado' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Valor da meta deve ser maior que 0' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE lógico
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `update metas_investimentos set deleted='*' where id=$1`,
      [id]
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
