import pkg from "pg";
const { Pool } = pkg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
(async () => {
  try {
    console.log("Banco conectado com sucesso!");
  } catch (error) {
    console.error("ERRO AO CONECTAR NO BANCO:");
    console.error(error.message);
  }
})();
