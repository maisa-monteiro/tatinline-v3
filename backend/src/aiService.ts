const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getHealthInsights(healthLogs: any[], diaryLogs: any[], activityLogs: any[]) {
  try {
    const prompt = `Analisa os seguintes dados de saúde, alimentação e atividade física recentes de um utilizador:
    - Registos de Saúde (Sono, Humor, Stress): ${JSON.stringify(healthLogs.slice(0, 5))}
    - Registos do Diário (Alimentação): ${JSON.stringify(diaryLogs.slice(0, 5))}
    - Registos de Atividade (Treinos e Peso): ${JSON.stringify(activityLogs.slice(0, 5))}

    Gera uma análise motivacional curta e perspicaz (máximo 2 parágrafos) em Português de Portugal, focada em tendências, correlações e conselhos práticos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text || 'Continua a registar os teus dados!';
  } catch (error: any) {
    console.error('Erro na IA (Google):', error.message);
    return 'Continua a registar os teus dados diariamente para que a IA consiga identificar padrões úteis para a tua saúde.';
  }
}

async function estimateCalories(description: string): Promise<number> {
  try {
    const prompt = `Tu és um nutricionista clínico altamente experiente e especialista em contagem calórica precisa. 
    Analisa a seguinte descrição de refeição introduzida por um utilizador: "${description}".

    Regras obrigatórias:
    1. Assume uma porção média/padrão caso o utilizador não especifique o tamanho (ex: "1 maçã" = uma unidade média de cerca de 150g, aproximadamente 80-95 kcal; "um prato de arroz" = porção normal).
    2. Calcula o valor calórico total estimado de forma realista com base na composição nutricional do alimento.
    3. Formato de resposta: Devolve APENAS e unicamente o valor numérico inteiro correspondente às calorias totais. Não incluas letras, pontos finais, unidades (como "kcal"), explicações ou texto adicional de espécie alguma (exemplo correto: 95).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const content = response.text?.trim();
    console.log(`IA (Google) - Refeição: "${description}" | Calorias calculadas:`, content);
    
    const cleanContent = content ? content.replace(/[^0-9]/g, '') : '';
    const calories = parseInt(cleanContent, 10);

    return isNaN(calories) ? 100 : calories;
  } catch (error: any) {
    console.error('ERRO DETALHADO DA IA (Google):', error.message);
    return 100; 
  }
}

module.exports = { getHealthInsights, estimateCalories };