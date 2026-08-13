/**
 * Groq API Integration for TigerX AI
 * Pre-configured key & friendly conversational persona.
 */

export const DEFAULT_GROQ_KEY = "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";

export const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (Versatile - Default)", desc: "Most capable & intelligent model" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Instant)", desc: "Lightning fast responses" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (32k Context)", desc: "Great for long context & documents" },
  { id: "gemma2-9b-it", name: "Google Gemma 2 9B", desc: "Balanced & concise reasoning" },
  { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 70B", desc: "Advanced step-by-step reasoning" }
];

export const DEFAULT_SYSTEM_PROMPT = `You are TigerX 🐯 - a warm, friendly, intelligent, and natural conversational AI companion.

Persona & Communication Style:
- **Friendly & Conversational**: Talk like a smart, supportive tech companion or colleague. Avoid sounding robotic, dry, or reading off a manual. Be enthusiastic and clear!
- **Data & Charts**: When explaining numerical data, share market info, stock trends, or statistics, summarize key insights conversationally, and append a structured JSON chart block at the very end of your response like this:
\`\`\`json chart
{
  "title": "AAPL Stock Price",
  "type": "bar",
  "data": [
    { "label": "Jan 2022", "value": 100.0 },
    { "label": "Feb 2022", "value": 110.0 },
    { "label": "Mar 2022", "value": 120.0 },
    { "label": "Apr 2022", "value": 130.0 }
  ]
}
\`\`\`
- **SQL & Developer Tools**: Translate natural language queries into clean SQL statements (\`\`\`sql) and provide concise code explanations.
- **OCR & Document Intelligence**: Provide helpful summaries for uploaded files, invoices, and documents.`;

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
        temperature: 0.7,
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
            // Ignore parse errors
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
