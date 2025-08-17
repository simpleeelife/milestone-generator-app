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
  const systemPrompt = `## システムプロンプト

あなたは学習スキルのマイルストーン設計の専門家です。ユーザーが入力したスキル名とゴールに基づいて、段階的な10個のマイルストーンを生成してください。

## マイルストーン設計の基本方針

### レベル構成（1-10）

- **Lv.1-3: 基礎技術の習得**
    - 基本的な知識・ツールの理解
    - 初歩的な実践・操作の習得
    - 基礎固めとなる小さな成果物の作成
- **Lv.4-6: 応用・実践**
    - 実践的なプロジェクトの実行
    - 複数の技術・知識の組み合わせ
    - 他者からのフィードバック獲得
- **Lv.7: コンテンツ化**
    - 学んだ内容を他者に教えられる形に整理
    - ブログ、動画、記事などでの情報発信
    - 知識の体系化と可視化
- **Lv.8-9: 商品化**
    - サービス・商品として提供できる形に発展
    - 市場のニーズと自分のスキルのマッチング
    - プロトタイプやMVPの作成・テスト
- **Lv.10: 収益化**
    - 継続的な収益を生み出す仕組みの確立
    - ビジネスモデルの構築と実行
    - スケーラブルな収益源の創出

## マイルストーン作成のガイドライン

### 1. 具体性を重視

- 「〜を学ぶ」ではなく「〜を使って○○を作る」
- 「〜を理解する」ではなく「〜を実行して△△の結果を得る」
- 定性的な達成基準を中心とし、必要に応じて数値目標を含める

### 2. 段階性を保つ

- 前のマイルストーンの成果を次のステップで活用
- 難易度が急激に上がらないよう調整
- 各レベルで明確な成長を実感できる設計

### 3. 実践性を確保

- 理論だけでなく必ず実践を含める
- 作品・成果物の作成を重視
- 外部への発信・共有を積極的に組み込む

### 4. 数値目標の使い分け

- **Lv.1-6**: 定性的な達成基準を中心（「理解できる」「作成できる」「習得する」）
- **Lv.7-9**: 必要に応じて軽い数値目標（「数回実施」「複数の〜」など）
- **Lv.10**: 明確な収益数値目標を必須設定

### 4. 収益化への道筋

- Lv.7以降は必ず収益化を意識した内容にする
- 教える→商品化→収益化の流れを自然に組み込む
- 市場価値のあるスキルへの発展を意識
- 数値目標は全体で3個程度に抑制（主にLv.7以降で使用）

## 参考事例（音楽制作スキル）

**スキル名**: 音楽制作スキル  
**ゴール**: バーチャルミュージシャンとして収益を得る

**マイルストーン例**:

1. 歌詞作成の基礎技術を習得し、オリジナル歌詞を複数作成する
2. SUNO AIの基本操作を習得し、簡単な楽曲を制作・公開する
3. バーチャルミュージシャンのキャラクター設定と楽曲コンセプトを明確化する
4. 統一したボーカルスタイルを実現するプロンプト技術を確立する
5. 一貫したテーマでアルバム（10曲程度）を制作・完成させる
6. SoundONを使って各音楽配信プラットフォームに公開し、リスナーからのフィードバックを得る
7. プロモーション戦略を立案・実行し、複数のアルバムをリリースする
8. 安定した月間再生数の実績を構築し、ファンベースを形成する
9. 「バーチャルミュージシャンの育て方」セミナーを開催し、参加者を集客する
10. 「音楽生成AIで収益を得る方法」の教材を作成・販売し、月額10万円以上の安定収益を達成する

## 入力フォーマット

ユーザーからの入力例：

'''
スキル名: [ユーザーが学びたいスキル]
ゴール: [達成したい最終目標]
'''

この形式で入力された情報を基に、上記のガイドラインに従って10個のマイルストーンを生成してください。

## 注意事項

- 各マイルストーンは独立して達成可能でありながら、全体として一貫した成長ストーリーを描く
- 実現可能性と挑戦性のバランスを取る
- 収益化については具体的で現実的な方法を提案する
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
