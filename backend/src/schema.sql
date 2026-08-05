-- 1. Tabela de Utilizador (Perfil único)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) DEFAULT 'Utilizador',
  sleep_hours_goal NUMERIC(4,2) DEFAULT 8.0,
  calories_goal INT DEFAULT 2000,
  water_ml_goal INT DEFAULT 2000,
  target_weight_kg NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Saúde (Pressão Arterial, Sono, Humor, Stress)
CREATE TABLE IF NOT EXISTS health_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE DEFAULT 1,
  kind VARCHAR(20) NOT NULL, -- 'bp', 'sleep', 'mood', 'stress'
  systolic INT,
  diastolic INT,
  bpm INT,
  sleep_hours NUMERIC(4,2),
  mood_value VARCHAR(20),
  stress_value VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela do Diário (Alimentação e Água)
CREATE TABLE IF NOT EXISTS diary_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE DEFAULT 1,
  kind VARCHAR(20) NOT NULL, -- 'food', 'water'
  description TEXT,
  calories INT,
  water_ml INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Atividade (Treinos, Peso, Cintura)
CREATE TABLE IF NOT EXISTS activity_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE DEFAULT 1,
  kind VARCHAR(20) NOT NULL, -- 'workout', 'weight', 'waist'
  workout_type VARCHAR(50),
  workout_label VARCHAR(100),
  minutes INT,
  calories_burned INT,
  weight_kg NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insere o utilizador inicial de forma segura
INSERT INTO users (id, name, calories_goal, water_ml_goal) 
SELECT 1, 'Meu Perfil', 2000, 2000
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);
