const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDatabase = async () => {
  try {
    // 1. Apaga as tabelas antigas para garantir que recria tudo limpo com a coluna 'name'
    console.log('A limpar tabelas antigas na nuvem...');
    await pool.query(`
      DROP TABLE IF EXISTS activity_entries CASCADE;
      DROP TABLE IF EXISTS diary_entries CASCADE;
      DROP TABLE IF EXISTS health_entries CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // 2. Lê e executa o schema.sql atualizado
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSql);
    console.log('Base de dados inicializada com sucesso através do schema.sql!');
  } catch (err) {
    console.error('Erro ao inicializar a base de dados:', err);
  }
};

initDatabase();

module.exports = { pool };
