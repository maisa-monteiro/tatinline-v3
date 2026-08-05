const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { router } = require('./routes');

const app = express();

// Configurações do Servidor
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', router);

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'ok', message: 'Servidor tatinline-v3 a rodar!' });
});

app.get('/api/test-db', async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Ligação à base de dados PostgreSQL bem-sucedida!',
      time: result.rows[0].now,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao ligar à base de dados',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
