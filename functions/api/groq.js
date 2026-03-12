export async function onRequestPost(context) {
    // 1. 環境変数を OpenAI 用に読み替え
    const OPENAI_API_KEY = context.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: "OpenAIのAPIキーが設定されていません。" }), { status: 500 });
    }

    try {
        const { text } = await context.request.json();

        // 2. OpenAI API (GPT-4o mini) を叩く
        // 読み上げ用なら mini で十分賢く、かつ料金も激安です
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", 
                messages: [
                    { 
                        role: "system", 
                        content: "日本語の読み上げ用変換器です。漢字を文脈に合わせて正確な『ひらがな』と『句読点』のみに変換してください。解説は一切不要です。" 
                    },
                    { role: "user", content: text }
                ],
                temperature: 0
            })
        });

        const data = await response.json();
        const reading = data.choices[0].message.content.trim();

        return new Response(JSON.stringify({ reading }), {
            headers: { "Content-Type": "application/json;charset=UTF-8" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
