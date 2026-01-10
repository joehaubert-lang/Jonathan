
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "dummy_key" });

export const analyzePosture = async (imageBase64: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Analise esta foto de avaliação física. Identifique desvios posturais nos seguintes pontos: Cabeça, Ombros, Pelve, Joelhos e Pés. Retorne um laudo técnico estruturado em JSON com os campos 'deviations' (lista de strings), 'alignmentScore' (0-100) e 'recommendation' (texto curto)." },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deviations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            alignmentScore: { type: Type.NUMBER },
            recommendation: { type: Type.STRING }
          },
          required: ["deviations", "alignmentScore", "recommendation"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro na análise postural:", error);
    return null;
  }
};

export const generateWorkoutSplit = async (studentGoal: string, level: string, daysPerWeek: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um plano de treino semanal para um aluno com o objetivo de ${studentGoal}, nível ${level}, treinando ${daysPerWeek} vezes por semana. Para cada exercício, tente incluir uma URL real do YouTube com a demonstração da execução no campo 'videoUrl'. Retorne os exercícios em formato estruturado.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              focus: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.NUMBER },
                    reps: { type: Type.STRING },
                    rest: { type: Type.STRING },
                    muscleGroup: { type: Type.STRING },
                    videoUrl: { type: Type.STRING, description: "Link do YouTube para execução do exercício" }
                  },
                  required: ["name", "sets", "reps", "rest", "muscleGroup"]
                }
              }
            },
            required: ["day", "focus", "exercises"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Erro ao gerar treino com Gemini:", error);
    return [];
  }
};

export const generateReminderMessage = async (studentName: string, amount: string, dueDate: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma mensagem curta, amigável e profissional para ser enviada via WhatsApp para o aluno ${studentName}. Informe que o pagamento de ${amount} vence no dia ${dueDate} e que estamos à disposição para dúvidas. Use um tom de coach motivador.`,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar mensagem de lembrete:", error);
    return "Olá! Passando para lembrar que seu plano vence em breve. Vamos manter o foco nos treinos!";
  }
};
