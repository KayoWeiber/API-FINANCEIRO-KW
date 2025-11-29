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

// PATCH dinâmico: recebe { campo, valor }
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const allowed = {
    data: 'data',
    descricao: 'descricao',
    valor: 'valor',
    categoria_id: 'categoria_id',
    forma_pagamento_id: 'forma_pagamento_id'
  };

  const coluna = allowed[campo];
  if (!coluna) {
    return res.status(400).json({ error: 'Campo inválido. Use um de: data, descricao, valor, categoria_id, forma_pagamento_id' });
  }

  try {
    const { rows } = await pool.query(
      `update gastos_variaveis set ${coluna}=$1 where id=$2 and deleted='' returning *`,
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

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `update gastos_variaveis set deleted='*' where id=$1`,
    [id]
  );
  res.sendStatus(204);
});

export default router;
