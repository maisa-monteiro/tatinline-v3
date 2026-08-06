const { Router } = require('express');
const { pool } = require('./db');
const { getHealthInsights, estimateCalories } = require('./aiService');

const router = Router();

// ==========================================
// UTILIZADORES E METAS
// ==========================================

router.get('/user/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/user/:id/goals', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { sleep_hours_goal, calories_goal, water_ml_goal, target_weight_kg } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET sleep_hours_goal = COALESCE($1, sleep_hours_goal),
           calories_goal = COALESCE($2, calories_goal),
           water_ml_goal = COALESCE($3, water_ml_goal),
           target_weight_kg = COALESCE($4, target_weight_kg)
       WHERE id = $5 RETURNING *`,
      [sleep_hours_goal, calories_goal, water_ml_goal, target_weight_kg, id]
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// REGISTOS DE SAÚDE (BP, Sono, Humor, Stress)
// ==========================================

router.post('/health', async (req: any, res: any) => {
  try {
    // Adicionámos 'bp' por defeito caso o frontend não envie o kind
    let { user_id, kind, systolic, diastolic, bpm, sleep_hours, mood_value, stress_value, timestamp } = req.body;
    
    if (!kind) {
      if (systolic) kind = 'bp';
      else if (sleep_hours) kind = 'sleep';
      else if (mood_value) kind = 'mood';
      else if (stress_value) kind = 'stress';
      else kind = 'bp';
    }

    const result = await pool.query(
      `INSERT INTO health_entries 
       (user_id, kind, systolic, diastolic, bpm, sleep_hours, mood_value, stress_value, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_TIMESTAMP))
       RETURNING *`,
      [user_id, kind, systolic, diastolic, bpm, sleep_hours, mood_value, stress_value, timestamp]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error("Erro na rota /health:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// REGISTOS DO DIÁRIO (Alimentação e Água com IA)
// ==========================================

router.post('/diary', async (req: any, res: any) => {
  try {
    let { user_id, kind, description, calories, water_ml, timestamp } = req.body;
    
    if (kind === 'food' && description && (!calories || calories === 0)) {
      calories = await estimateCalories(description);
    }

    const result = await pool.query(
      `INSERT INTO diary_entries 
       (user_id, kind, description, calories, water_ml, timestamp)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))
       RETURNING *`,
      [user_id, kind, description, calories, water_ml, timestamp]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --> ROTA ADICIONADA: Busca histórico do Diário do utilizador <--
router.get('/diary/user/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// REGISTOS DE ATIVIDADE (Treino, Peso, Cintura)
// ==========================================

router.post('/activity', async (req: any, res: any) => {
  try {
    const { user_id, kind, workout_type, workout_label, minutes, calories_burned, weight_kg, waist_cm, timestamp } = req.body;
    
    const result = await pool.query(
      `INSERT INTO activity_entries 
       (user_id, kind, workout_type, workout_label, minutes, calories_burned, weight_kg, waist_cm, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_TIMESTAMP))
       RETURNING *`,
      [user_id, kind, workout_type, workout_label, minutes, calories_burned, weight_kg, waist_cm, timestamp]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity/user/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM activity_entries WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:table/:id', async (req: any, res: any) => {
  try {
    const { table, id } = req.params;
    const allowedTables = ['health_entries', 'diary_entries', 'activity_entries'];
    
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Registo eliminado com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resumo diário
router.get('/summary/user/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    
    const userRes = await pool.query('SELECT calories_goal, water_ml_goal FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0] || { calories_goal: 1720, water_ml_goal: 2000 };

    const foodRes = await pool.query(
      `SELECT SUM(calories) as total_consumed, SUM(water_ml) as total_water 
       FROM diary_entries 
       WHERE user_id = $1 AND timestamp::date = CURRENT_DATE`,
      [userId]
    );

    const workoutRes = await pool.query(
      `SELECT SUM(calories_burned) as total_burned, SUM(minutes) as total_minutes 
       FROM activity_entries 
       WHERE user_id = $1 AND kind = 'workout' AND timestamp::date = CURRENT_DATE`,
      [userId]
    );

    const totalConsumed = foodRes.rows[0].total_consumed || 0;
    const totalWater = foodRes.rows[0].total_water || 0;
    const totalBurned = workoutRes.rows[0].total_burned || 0;

    res.json({
      caloriesGoal: user.calories_goal,
      caloriesConsumed: totalConsumed,
      caloriesBurned: totalBurned,
      netCalories: totalConsumed - totalBurned,
      waterMl: totalWater,
      waterGoal: user.water_ml_goal,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Insights de IA
router.get('/ai/insights/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const healthRes = await pool.query('SELECT * FROM health_entries WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10', [userId]);
    const diaryRes = await pool.query('SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10', [userId]);
    const activityRes = await pool.query('SELECT * FROM activity_entries WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10', [userId]);

    const insights = await getHealthInsights(healthRes.rows, diaryRes.rows, activityRes.rows);

    res.json({ success: true, insights });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router };