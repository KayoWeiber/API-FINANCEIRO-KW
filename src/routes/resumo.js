import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ÚNICO handler usando CTE para montar JSON completo (mais eficiente, menos round trips)
const sql = `
with entradas_tipo as (
  select tipo_renda, sum(valor)::numeric as total
  from entradas
  where user_id=$1 and competencia_id=$2 and deleted=''
  group by tipo_renda
),
entradas_total as (
  select coalesce(sum(valor),0)::numeric as total
  from entradas
  where user_id=$1 and competencia_id=$2 and deleted=''
),
gastos_var_cat as (
  select c.id as categoria_id, c.nome, sum(gv.valor)::numeric as total
  from gastos_variaveis gv
  join categorias c on c.id = gv.categoria_id
  where gv.user_id=$1 and gv.competencia_id=$2 and gv.deleted='' and c.deleted=''
  group by c.id, c.nome
),
gastos_var_total as (
  select coalesce(sum(valor),0)::numeric as total
  from gastos_variaveis
  where user_id=$1 and competencia_id=$2 and deleted=''
),
gastos_fixos_cat as (
  select c.id as categoria_id, c.nome, sum(gf.valor)::numeric as total
  from gastos_fixos gf
  join categorias c on c.id = gf.categoria_id
  where gf.user_id=$1 and gf.competencia_id=$2 and gf.deleted='' and c.deleted=''
  group by c.id, c.nome
),
gastos_fixos_total as (
  select coalesce(sum(valor),0)::numeric as total
  from gastos_fixos
  where user_id=$1 and competencia_id=$2 and deleted=''
),
investimentos_total as (
  select coalesce(sum(valor),0)::numeric as total
  from investimentos
  where user_id=$1 and competencia_id=$2 and deleted=''
),
gastos_var_fp as (
  select fp.id as forma_pagamento_id, fp.tipo, sum(gv.valor)::numeric as total
  from gastos_variaveis gv
  join formas_pagamento fp on fp.id = gv.forma_pagamento_id
  where gv.user_id=$1 and gv.competencia_id=$2 and gv.deleted='' and fp.deleted=''
  group by fp.id, fp.tipo
),
gastos_fixos_fp as (
  select fp.id as forma_pagamento_id, fp.tipo, sum(gf.valor)::numeric as total
  from gastos_fixos gf
  join formas_pagamento fp on fp.id = gf.forma_pagamento_id
  where gf.user_id=$1 and gf.competencia_id=$2 and gf.deleted='' and fp.deleted=''
  group by fp.id, fp.tipo
),
despesas_fp_combined as (
  select forma_pagamento_id, tipo, sum(total)::numeric as total
  from (
    select forma_pagamento_id, tipo, total from gastos_var_fp
    union all
    select forma_pagamento_id, tipo, total from gastos_fixos_fp
  ) t
  group by forma_pagamento_id, tipo
)
select
  json_build_object(
    'competencia_id',$2,
    'user_id',$1,
    'entradas', json_build_object(
      'total',(select total from entradas_total),
      'por_tipo',(select coalesce(json_agg(entradas_tipo), '[]'::json) from entradas_tipo)
    ),
    'despesas', json_build_object(
      'variaveis', json_build_object(
        'total',(select total from gastos_var_total),
        'por_categoria',(select coalesce(json_agg(gastos_var_cat order by nome), '[]'::json) from gastos_var_cat),
        'por_forma_pagamento',(select coalesce(json_agg(gastos_var_fp order by tipo), '[]'::json) from gastos_var_fp)
      ),
      'fixas', json_build_object(
        'total',(select total from gastos_fixos_total),
        'por_categoria',(select coalesce(json_agg(gastos_fixos_cat order by nome), '[]'::json) from gastos_fixos_cat),
        'por_forma_pagamento',(select coalesce(json_agg(gastos_fixos_fp order by tipo), '[]'::json) from gastos_fixos_fp)
      )
    ),
    'investimentos', json_build_object(
      'total',(select total from investimentos_total)
    ),
    'formas_pagamento_total', (select coalesce(json_agg(despesas_fp_combined order by tipo), '[]'::json) from despesas_fp_combined)
  ) as resumo;
`;
router.get("/:user_id/:competencia_id", async (req,res) => {
  const { user_id, competencia_id } = req.params; // manter como string (uuid ou número)
  if (!user_id || !competencia_id) {
    return res.status(400).json({ error: "Parâmetros obrigatórios" });
  }
  try {
    const { rows } = await pool.query(sql, [user_id, competencia_id]);
    if (!rows.length) return res.json({});
    res.json(rows[0].resumo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;