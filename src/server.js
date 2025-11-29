import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import 'dotenv/config';
import { pool } from "./db.js";
import investimentosRouter from "./routes/investimentos.js";
import competenciasRouter from "./routes/competencias.js";
import categoriasRouter from "./routes/categorias.js";
import formasPagamentoRouter from "./routes/formasPagamento.js";
import gastosVariaveisRouter from "./routes/gastosVariaveis.js";
import gastosFixosRouter from "./routes/gastosFixos.js";
import entradasRouter from "./routes/entradas.js";

const app = express();

// Trust proxy (necessário se estiver atrás de proxy/reverse-proxy)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Middlewares globais
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// Rate limiting básico
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use("/investimentos", investimentosRouter);
app.use("/competencias", competenciasRouter);
app.use("/categorias", categoriasRouter);
app.use("/formas-pagamento", formasPagamentoRouter);
app.use("/gastos-variaveis", gastosVariaveisRouter);
app.use("/gastos-fixos", gastosFixosRouter);
app.use("/entradas", entradasRouter);

app.get("/", (req, res) => {
  res.send("API Financeira Online");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

// Error handler
// Em produção, evite vazar detalhes do erro
// Express 5 já captura erros async sem bibliotecas extras
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Unexpected error';
  res.status(status).json({ error: message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Servidor rodando na porta " + port);
});
