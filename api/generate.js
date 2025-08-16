// Vercel Serverless Function to securely call the Gemini API

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get skill and goal from the request body
  const { skillName, goal } = request.body;

  if (!skillName || !goal) {
    return response.status(400).json({ message: 'Skill name and goal are required.' });
  }

  // Get the API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ message: 'API key is not configured.' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  // This is the same prompt and payload structure as before
  const systemPrompt = `あなたは学習スキルのマイルストーン設計の専門家です。ユーザーが入力したスキル名とゴールに基づいて、段階的な10個のマイルストーンを生成してください。

## マイルストーン設計の基本方針

### レベル構成（1-10）

- **Lv.1-3: 基礎技術の習得**
- **Lv.4-6: 応用・実践**
- **Lv.7: コンテンツ化**
- **Lv.8-9: 商品化**
- **Lv.10: 収益化**

## マイルストーン作成のガイドライン

### 1. 具体性を重視
- 「〜を学ぶ」ではなく「〜を使って○○を作る」
- 「〜を理解する」ではなく「〜を実行して△△の結果を得る」

### 2. 段階性を保つ
- 前のマイルストーンの成果を次のステップで活用

### 3. 実践性を確保
- 理論だけでなく必ず実践を含める

### 4. 収益化への道筋
- Lv.7以降は必ず収益化を意識した内容にする
- ユーザーの入力したゴールと最終マイルストーン（Lv.10）が明確に繋がるようにする`;
  
  const userPrompt = `スキル名: ${skillName}\nゴール: ${goal}`;
  const chatHistory = [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }];
  const payload = {
      contents: chatHistory,
      generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
              type: "OBJECT",
              properties: {
                  milestones: {
                      type: "ARRAY",
                      items: {
                          type: "OBJECT",
                          properties: {
                              level: { type: "NUMBER" },
                              milestone: { type: "STRING" }
                          },
                          required: ["level", "milestone"]
                      }
                  }
              },
              required: ["milestones"]
          }
      }
  };

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Gemini API Error:', errorText);
      return response.status(apiResponse.status).json({ message: `API error: ${errorText}` });
    }

    const result = await apiResponse.json();
    
    const jsonText = result.candidates[0].content.parts[0].text;
    const parsedJson = JSON.parse(jsonText);

    // Send the successful response back to the browser
    return response.status(200).json(parsedJson);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An internal error occurred.' });
  }
}
