/**
 * Groq API Integration for TigerX AI
 * Default API Key pre-filled from user request.
 */

export const DEFAULT_GROQ_KEY = "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";

export const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile - Default)", desc: "Most capable & intelligent model" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant)", desc: "Lightning fast responses" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k Context)", desc: "Great for long context & documents" },
  { id: "gemma2-9b-it", name: "Google Gemma 2 9B", desc: "Balanced & concise reasoning" },
  { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 70B", desc: "Advanced step-by-step reasoning" }
];

export const DEFAULT_SYSTEM_PROMPT = `You are TigerX AI 🐯 - an elite, fiercely intelligent AI chatbot & developer assistant.

Your Capabilities & Guidelines:
1. **File & Data Analysis (Excel, CSV, PDF, Word, TXT, Images)**:
   - When user uploads files (Excel, CSV, PDF, Word, Images), analyze records, calculate totals, identify trends, detect anomalies, compare documents, and answer questions.
   - For tabular or statistical outputs (e.g., active vs inactive employees, sales by month), ALWAYS append a structured JSON chart block at the very end of your response in this exact format:
\`\`\`json chart
{
  "title": "Chart Title",
  "type": "bar", // or "pie" or "table"
  "data": [
    { "label": "Active", "value": 45 },
    { "label": "Inactive", "value": 12 }
  ]
}
\`\`\`

2. **Natural Language to SQL**:
   - Translate natural language queries into clean, syntactically correct SQL (SELECT, JOIN, WHERE, GROUP BY). Format code using \`\`\`sql blocks.

3. **OCR & Invoice Understanding**:
   - Extract Invoice #, Vendor Name, GST/Tax ID, Date, Total Amount, and Items table clearly formatted.

4. **Developer Power Tools**:
   - Code generation, refactoring, bug detection, Stored Procedures, API routes, JSON formatting, Regex, Error Log Analysis, Git assistance.

5. **Tone**: Direct, accurate, intelligent, warm, confident. Use clean markdown formatting with clear headings, bullet points, and code blocks.`;

/**
 * Stream completion response from Groq API
 */
export async function streamGroqChat({
  apiKey = DEFAULT_GROQ_KEY,
  model = "llama-3.3-70b-versatile",
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  messages = [],
  onChunk,
  onError,
  onFinish
}) {
  const activeKey = apiKey.trim() || DEFAULT_GROQ_KEY;

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${activeKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.6,
        max_tokens: 4096,
        stream: true
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson.error?.message || `Groq API Error (${response.status}): ${response.statusText}`;
      throw new Error(errMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;

        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.substring(6));
            const delta = data.choices?.[0]?.delta?.content || "";
            if (delta) {
              accumulatedText += delta;
              if (onChunk) onChunk(delta, accumulatedText);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }

    if (onFinish) onFinish(accumulatedText);
    return accumulatedText;
  } catch (err) {
    console.error("Stream Groq Chat Error:", err);
    if (onError) onError(err);
    throw err;
  }
}
