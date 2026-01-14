const GEMINI_API_KEY = 'AIzaSyB11r4cWuJBk8DF32SP3zdKPPwNNySzxR0'; // A chave anterior foi bloqueada por vazamento
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_NAME = 'gemini-flash-latest'; // Nome exato que apareceu na lista de diagnóstico

export interface WorkoutParams {
    studentName: string;
    goal: string;
    level: string;
    frequency: string;
    location: string; // Gym, Home, etc.
    limitations: string;
}

export const generateAIWorkout = async (params: WorkoutParams) => {
    const prompt = `Crie um treino de musculação completo e profissional para o aluno ${params.studentName}.
    Objetivo: ${params.goal}
    Nível: ${params.level}
    Frequência: ${params.frequency} vezes por semana
    Local de treino: ${params.location}
    Limitações/Observações: ${params.limitations || 'Nenhuma'}

    Responda APENAS com o objeto JSON. Não inclua nenhuma explicação, introdução ou formatação markdown (como \`\`\`json). O resultado deve ser um JSON válido que possa ser processado diretamente por JSON.parse().
    Estrutura obrigatória:
    {
      "workout_name": "Nome do Treino",
      "goal": "Objetivo resumido",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "sets": 3,
          "reps": "12",
          "load": "Moderada",
          "rest": "60s",
          "muscle_group": "Peito",
          "observation": "Dica de execução"
        }
      ]
    }`;

    try {
        const url = `${BASE_URL}/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            throw new Error(`Erro na API do Gemini: ${data.error.message || 'Erro desconhecido'}`);
        }

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            console.error('Unexpected Gemini Response:', data);
            throw new Error('A IA não conseguiu gerar uma resposta. Tente novamente com parâmetros diferentes.');
        }

        const text = data.candidates[0].content.parts[0].text;

        // Sanitize response to ensure it's valid JSON (remove markdown snippets if AI includes them)
        const sanitizedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(sanitizedJson);
        } catch (parseError) {
            console.error('JSON Parse Error:', text);
            throw new Error('A resposta da IA veio em um formato inválido. Tente gerar novamente.');
        }
    } catch (error: any) {
        console.error('Error calling Gemini:', error);
        throw new Error(error.message || 'Falha ao conectar com o serviço de IA.');
    }
};
