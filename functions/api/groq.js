export async function onRequestPost(context) {
    // 1. 環境変数からAPIキーを取得（ブラウザからは見えない）
    const GROQ_API_KEY = context.env.GROQ_API_KEY;
    
    // 2. フロントから届いたテキストを取得
    const { text } = await context.request.json();

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "日本語の読み上げ用ひらがな変換器です。ひらがなと句読点のみ出力せよ。解説禁止。" },
                    { role: "user", content: text }
                ],
                temperature: 0.1
            })
        });

        const data = await response.json();
        const reading = data.choices[0].message.content.trim();

        return new Response(JSON.stringify({ reading }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
