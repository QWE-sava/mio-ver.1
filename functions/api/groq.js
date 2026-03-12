export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();

        // 安定版の v1 エンドポイントを使用
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `以下の日本語を、文脈に合わせた「ひらがな」と「句読点」のみに変換してください。解説や漢字は一切含めないでください。
入力：${text}`
                    }]
                }],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 200
                }
            })
        });

        const data = await response.json();

        // エラーレスポンスのチェック
        if (data.error) {
            return new Response(JSON.stringify({ error: data.error.message, detail: "API Error" }), { status: 500 });
        }

        // Gemini 1.5 の正常なレスポンス構造を解析
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const reading = data.candidates[0].content.parts[0].text.trim();
            return new Response(JSON.stringify({ reading }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Geminiからの応答が解析できませんでした", raw: data }), { status: 500 });
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
