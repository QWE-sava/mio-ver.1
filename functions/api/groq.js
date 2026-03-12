export async function onRequestPost(context) {
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "Gemini APIキーが設定されていません。" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();
        
        // Gemini API エンドポイント
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `あなたは日本語の読み上げ専門の変換器です。
以下の入力テキストを、文脈に合わせた自然な「ひらがな」と「句読点」のみに変換してください。
【ルール】
解説、漢字、カッコなどは一切出力しない。ひらがなと句読点のみ。
入力：${text}` 
                    }]
                }],
                generationConfig: {
                    temperature: 0,
                    topP: 0.1
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const reading = data.candidates[0].content.parts[0].text.trim();
            return new Response(JSON.stringify({ reading }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Geminiからの応答が空です", detail: data }), { status: 500 });
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
