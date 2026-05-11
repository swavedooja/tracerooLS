import { POLICY_PDF_BASE64 } from '../assets/policyBase64';

const GEMINI_API_KEY = "AIzaSyC7aAEurqM5oZx7VQKhZQsEVd6TiSwspco";
const GEMINI_MODEL = "gemini-2.5-flash"; // As requested by the user
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const GeminiService = {
  /**
   * Sends a claim query to clAImax (Gemini) with optional file attachment
   */
  chat: async (userMessage, fileData = null) => {
    const systemInstruction = `You are a strict insurance claims adjudicator. You have the full policy document. For every claim query you MUST:
1. Reference the exact policy section(s) by number/name.
2. Clearly state a RECOMMENDATION for APPROVAL or REJECTION.
3. Give a short, professional reason.

Full Policy Document:`;

    const parts = [
      {
        text: systemInstruction
      },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: POLICY_PDF_BASE64
        }
      }
    ];

    // Add user's uploaded file if present
    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data // base64 string
        }
      });
    }

    // Add user's text message
    parts.push({
      text: `User claim query: ${userMessage || "Please analyze the attached document for a potential claim."}`
    });

    const body = {
      contents: [{
        parts: parts
      }]
    };

    try {
      console.log('clAImax AI: Sending request to Gemini...', { model: GEMINI_MODEL });
      
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('clAImax AI: API Error Status:', response.status);
        console.error('clAImax AI: API Error Body:', errorText);
        throw new Error(`AI API connection failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('clAImax AI: Received response:', data);
      
      // Gemini response structure: data.candidates[0].content.parts[0].text
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return botResponse || "I am clAImax, your insurance adjudicator. I am currently unable to process your claim.";
    } catch (error) {
      console.error('clAImax AI: Error Log:', error);
      return "I'm clAImax. I'm having trouble connecting to the adjudication system right now. Please try again in a moment.";
    }
  }
};
