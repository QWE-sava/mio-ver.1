export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();

        // モデル名をURLに含める形式（これが一番確実です）
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `あなたは日本語の読み上げ専門の変換器です。
文脈に合わせて漢字を「ひらがな」と「句読点」のみに変換してください。
例：最中を食べる→もなかをたべる
例：会議の最中→かいぎのさいちゅう
入力：${text}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.95,
                    maxOutputTokens: 100,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
        }

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const reading = data.candidates[0].content.parts[0].text.trim();
            return new Response(JSON.stringify({ reading }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Gemini response structure is unexpected", raw: data }), { status: 500 });
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
