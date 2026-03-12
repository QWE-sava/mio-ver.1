export async function onRequestPost(context) {
    console.log("--- API Start ---");
    const API_KEY = context.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        console.error("Error: GEMINI_API_KEY is missing!");
        return new Response(JSON.stringify({ error: "Cloudflare側の環境変数が見つかりません。" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();
        console.log("Input text:", text);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `以下の日本語をひらがなと句読点のみに変換して。解説不要。：${text}` }] }]
            })
        });

        const data = await response.json();
        console.log("Gemini Raw Response:", JSON.stringify(data));

        if (data.candidates && data.candidates[0].content) {
            const reading = data.candidates[0].content.parts[0].text.trim();
            return new Response(JSON.stringify({ reading }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        } else {
            console.error("Gemini Error or Blocked:", data);
            return new Response(JSON.stringify({ error: "Geminiからの応答が不正です", detail: data }), { status: 500 });
        }

    } catch (e) {
        console.error("Catch Error:", e.message);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
