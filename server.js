import express from "express";
import cors from "cors";
import 'dotenv/config';
import { pool } from "./db.js";
import investimentosRouter from "./routes/investimentos.js";
import competenciasRouter from "./routes/competencias.js";
import categoriasRouter from "./routes/categorias.js";
import formasPagamentoRouter from "./routes/formasPagamento.js";
import gastosVariaveisRouter from "./routes/gastosVariaveis.js";
import entradasRouter from "./routes/entradas.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/investimentos", investimentosRouter);
app.use("/competencias", competenciasRouter);
app.use("/categorias", categoriasRouter);
app.use("/formas-pagamento", formasPagamentoRouter);
app.use("/gastos-variaveis", gastosVariaveisRouter);
app.use("/entradas", entradasRouter);

app.get("/", (req, res) => {
    res.send("API Financeira Online");
});
app.listen(process.env.PORT, () => {
    console.log("Servidor rodando na porta " + process.env.PORT);
});








// CRUD routes moved to dedicated router files under ./routes
