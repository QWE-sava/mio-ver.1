export async function onRequestPost(context) {
    const GROQ_API_KEY = context.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({ error: "環境変数 GROQ_API_KEY がありません。" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: `あなたは日本語の読み上げ専門の変換器です。
以下のルールを厳守してください：
1. 入力された漢字を、文脈に合わせた自然な「ひらがな」と「句読点」のみに変換する。
2. 「最中」は食べ物の文脈なら「もなか」、進行中の文脈なら「さいちゅう」と正確に読み分けること。
3. 「もち中」「もちょう」といった誤変換は絶対にしないこと。
4. 解説、漢字、句書き、カッコ、などは一切出力せず、ひらがなのみを出力すること。` 
                    },
                    { role: "user", content: text }
                ],
                temperature: 0.0 // 創造性をゼロにして、最も確率の高い「正解」を選ばせる
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
