import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Helper function to convert Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateSummaryFromAudio(audioBlob) {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    const prompt = `
      You are an AI meeting assistant. Listen to this recorded meeting audio and generate a structured summary.
      Format precisely with these exact sections:
      ### Executive Summary
      ### Key Decisions
      ### Action Items (with ownership assigned if mentioned)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: prompt },
        { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Error generating AI summary from audio:", error);
    throw error;
  }
}