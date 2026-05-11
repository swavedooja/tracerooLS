import { POLICY_PDF_BASE64 } from '../assets/policyBase64';

const GEMINI_API_KEY = "AIzaSyC7aAEurqM5oZx7VQKhZQsEVd6TiSwspco";
const GEMINI_MODEL = "gemini-2.5-flash"; 
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const GeminiService = {
  /**
   * Sends a claim query to clAImax (Gemini) with optional file attachment
   * Includes a retry mechanism for 503 errors
   */
  chat: async (userMessage, fileData = null, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    const systemInstruction = `You are a strict insurance claims adjudicator. You have the full policy document. For every claim query you MUST:
1. Reference the exact policy section(s) by number/name.
2. Clearly state a RECOMMENDATION for APPROVAL or REJECTION.
3. Give a short, professional reason.

Full Policy Document:`;

    const parts = [
      { text: systemInstruction },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: POLICY_PDF_BASE64
        }
      }
    ];

    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data
        }
      });
    }

    parts.push({
      text: `User claim query: ${userMessage || "Please analyze the attached document for a potential claim."}`
    });

    const body = {
      contents: [{ parts: parts }]
    };

    try {
      const requestBody = JSON.stringify(body);
      console.log(`clAImax AI: Sending request to Gemini (Attempt ${retryCount + 1})...`, { 
        model: GEMINI_MODEL, 
        bodyLength: requestBody.length
      });
      
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });

      if (response.status === 503 && retryCount < MAX_RETRIES) {
        console.warn('clAImax AI: Service busy (503). Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return GeminiService.chat(userMessage, fileData, retryCount + 1);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('clAImax AI: API Error:', response.status, errorText);
        throw new Error(`AI API connection failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return botResponse || "I am clAImax, your insurance adjudicator. I am currently unable to process your claim.";
    } catch (error) {
      console.error('clAImax AI: Error Log:', error);
      return "I'm clAImax. The adjudication system is currently under high demand. Please try one more time in a few seconds.";
    }
  }
};
