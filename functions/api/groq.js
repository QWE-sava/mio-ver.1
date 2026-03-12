export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();

        // Gemini 2.0 Flash を指定 (2026年現在の最新安定版名称)
        const modelName = "gemini-2.0-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `あなたは日本語の正確な読み上げ変換器です。
文脈に基づき、以下のテキストをひらがなと句読点のみに変換してください。
【例】
・最中を食べる → もなかをたべる
・会議の最中 → かいぎのさいちゅう
・下手から登場 → しもてからとうじょう
・字が下手だ → じがへただ

入力：${text}` 
                    }]
                }],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 500
                }
            })
        });

        const data = await response.json();

        // エラーハンドリング
        if (data.error) {
            return new Response(JSON.stringify({ 
                error: `Gemini 2.0 Error: ${data.error.message}`,
                type: data.error.status
            }), { status: 500 });
        }

        // 2.0系のレスポンスからテキストを抽出
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const reading = data.candidates[0].content.parts[0].text.trim();
            return new Response(JSON.stringify({ reading }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Gemini 2.0 からの応答構造が異常です", raw: data }), { status: 500 });
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: `System Error: ${e.message}` }), { status: 500 });
    }
}
