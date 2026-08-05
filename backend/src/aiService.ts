const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getHealthInsights(healthLogs: any[], diaryLogs: any[], activityLogs: any[]) {
  try {
    const prompt = `Analisa os seguintes dados de saúde, alimentação e atividade física recentes de um utilizador:
    - Registos de Saúde (Sono, Humor, Stress): ${JSON.stringify(healthLogs.slice(0, 5))}
    - Registos do Diário (Alimentação): ${JSON.stringify(diaryLogs.slice(0, 5))}
    - Registos de Atividade (Treinos e Peso): ${JSON.stringify(activityLogs.slice(0, 5))}

    Gera uma análise motivacional curta e perspicaz (máximo 2 parágrafos) em Português de Portugal, focada em tendências, correlações e conselhos práticos.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Continua a registar os teus dados!';
  } catch (error: any) {
    console.error('Erro na IA:', error.message);
    return 'Continua a registar os teus dados diariamente para que a IA consiga identificar padrões úteis para a tua saúde.';
  }
}

async function estimateCalories(description: string): Promise<number> {
  try {
    const prompt = `Estima de forma realista e baseada na ciência nutricional o número de calorias (apenas o valor numérico inteiro, ex: 150) para a seguinte descrição de refeição: "${description}". Responde APENAS com o número inteiro, sem texto adicional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    console.log(`IA - Refeição: "${description}" | Calorias calculadas:`, content); // <--- Adiciona isto
    
    const calories = parseInt(content || '300', 10);
    return isNaN(calories) ? 300 : calories;
  } catch (error: any) {
    console.error('ERRO DETALHADO DA IA:', error.response?.data || error.message); // <--- E isto
    return 300; 
  }
}

module.exports = { getHealthInsights, estimateCalories };
