import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const code = req.body && req.body.code ? req.body.code : null;
  if (!code) {
    res.status(400).json({ message: 'Code is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.error("Gemini Error: Invalid API Key Detected");
    res.status(400).json({ error: "Invalid API Key: Please update your GEMINI_API_KEY secret in AI Studio settings or Vercel Environment Variables. Currently it is set to the default placeholder." });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Perform a deep quality control (QC) and functional audit on the following Python/Colab code. 
  Assess logic correctness, potential security vulnerabilities, performance bottlenecks, and adherence to best practices.
  
  Provide a structured response.
  
  Code to analyze:
  \`\`\`python
  ${code}
  \`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise overview of the code quality." },
            score: { type: Type.NUMBER, description: "A general quality score from 0 to 100." },
            suggestedOptimizations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of high-level optimization suggestions."
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["error", "warning", "suggestion"] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  codeSnippet: { type: Type.STRING },
                  fix: { type: Type.STRING }
                },
                required: ["type", "title", "description"]
              }
            }
          },
          required: ["summary", "score", "issues", "suggestedOptimizations"]
        }
      }
    });

    let text = response.text || "{}";
    // Strip markdown formatting if the model leaked it
    text = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const result = JSON.parse(text);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
