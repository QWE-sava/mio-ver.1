export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    if (!API_KEY) return new Response(JSON.stringify({ error: "API_KEY missing" }), { status: 500 });

    try {
        const { text } = await context.request.json();

        // 【2026年3月最新】画像で確認できた、唯一「人権」があるモデル
        const modelName = "gemini-3.1-flash-lite-preview"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `あなたは読み上げ支援AIです。以下の日本語をひらがなと句読点のみに直してください：${text}` }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 256
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return new Response(JSON.stringify({ 
                error: `Google API Error: ${data.error.message}`,
                model: modelName
            }), { status: 500 });
        }

        const reading = data.candidates[0].content.parts[0].text.trim();
        return new Response(JSON.stringify({ reading }), {
            headers: { "Content-Type": "application/json;charset=UTF-8" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
