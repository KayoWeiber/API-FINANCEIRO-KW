import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// POST /gastos-fixos
router.post("/", async (req, res) => {
  const { user_id, competencia_id, categoria_id, forma_pagamento_id, data, descricao, valor, pago } = req.body;
  try {
    const { rows } = await pool.query(
      `insert into gastos_fixos 
       (user_id, competencia_id, categoria_id, forma_pagamento_id, data, descricao, valor, pago)
       values ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,false)) returning *`,
      [user_id, competencia_id, categoria_id, forma_pagamento_id, data || null, descricao || null, valor, pago]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /gastos-fixos/:competencia_id
router.get("/:competencia_id", async (req, res) => {
  const { competencia_id } = req.params;
  try {
    const { rows } = await pool.query(
      `select * from gastos_fixos
       where competencia_id=$1 and deleted='' 
       order by data asc nulls last, descricao asc`,
      [competencia_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH dinâmico { campo, valor }
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const allowed = {
    data: 'data',
    descricao: 'descricao',
    valor: 'valor',
    pago: 'pago',
    categoria_id: 'categoria_id',
    forma_pagamento_id: 'forma_pagamento_id'
  };
  const coluna = allowed[campo];
  if (!coluna) {
    return res.status(400).json({ error: 'Campo inválido. Use: data, descricao, valor, pago, categoria_id, forma_pagamento_id' });
  }

  try {
    const { rows } = await pool.query(
      `update gastos_fixos set ${coluna}=$1 where id=$2 and deleted='' returning *`,
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

// DELETE lógico /gastos-fixos/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `update gastos_fixos set deleted='*' where id=$1`,
      [id]
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
