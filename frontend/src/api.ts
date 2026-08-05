import axios from 'axios';

// Instância do Axios a apontar para o teu backend Express
export const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
});

// --- FUNÇÕES DA API ---

// 1. Obter dados do utilizador (Perfil)
export async function getUserProfile(userId: number = 1) {
  const response = await api.get(`/user/${userId}`);
  return response.data;
}

// 2. Obter o resumo diário (Calorias, Água, etc.)
export async function getDailySummary(userId: number = 1) {
  const response = await api.get(`/summary/user/${userId}`);
  return response.data;
}

// 3. Adicionar um registo ao diário (Comida ou Água)
export async function addDiaryEntry(data: {
  user_id?: number;
  kind: string; // 'food' ou 'water'
  description?: string;
  calories?: number;
  water_ml?: number;
}) {
  const response = await api.post('/diary', {
    user_id: 1, // Por defeito usamos o ID 1
    ...data,
  });
  return response.data;
}

// 4. Obter o histórico do diário
export async function getDiaryHistory(userId: number = 1) {
  const response = await api.get(`/diary/user/${userId}`);
  return response.data;
}
