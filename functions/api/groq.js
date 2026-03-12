export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();

        // 2.0の制限を回避し、1.5よりも賢い「2.5 Flash」をターゲットにします
        const modelName = "gemini-2.5-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `あなたは日本語の正確な読み分けに特化したAI助手です。
入力された文章を「ひらがな」と「句読点」のみに変換してください。

【制約条件】
1. 漢字はすべてひらがなに直す。
2. 解説や補足、元の文章は一切含めない。
3. 文脈を読み、同音異義語（例：下手→しもて/へた、最中→もなか/さいちゅう）を正しく読み分ける。

入力：${text}` 
                    }]
                }],
                generationConfig: {
                    temperature: 0,
                    topP: 0.95,
                    maxOutputTokens: 300
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ 
                error: `Gemini 2.5 Error: ${data.error.message}`,
                detail: "もしモデルが見つからない場合は 1.5-flash-8b へのフォールバックを検討してください" 
            }), { status: 500 });
        }

        if (data.candidates && data.candidates[0].content) {
            const reading = data.candidates[0].content.parts[0].text.trim();
            return new Response(JSON.stringify({ reading }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        } else {
            return new Response(JSON.stringify({ error: "応答データが空です", raw: data }), { status: 500 });
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: `System Error: ${e.message}` }), { status: 500 });
    }
}
