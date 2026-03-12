export async function onRequestPost(context) {
    // 1. 環境変数からAPIキーを取得
    const GROQ_API_KEY = context.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({ error: "環境変数 GROQ_API_KEY が設定されていません。Cloudflareの管理画面を確認してください。" }), { status: 500 });
    }

    try {
        // フロントエンドからの入力を取得
        const { text } = await context.request.json();

        // Groq API (Gemma 2 9B) へのリクエスト
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gemma2-9b-it", // Googleの軽量・高性能モデルを指定
                messages: [
                    { 
                        role: "system", 
                        content: `あなたは日本語の文章を、読み上げ用の「ひらがな」に変換する専門家です。
以下のルールを厳守してください：
1. 文脈（文全体の流れ）を読み取り、適切な読みを選択すること。
2. 「下手」：舞台用語や位置（〜から登場、〜に座る等）なら「しもて」、技量（苦手）なら「へた」。
3. 「最中」：食べ物なら「もなか」、〜している時なら「さいちゅう」。
4. 「人気」：気配なら「ひとけ」、評判なら「にんき」。
        // エラーハンドリング
        if (!response.ok) {
            const errorData = await response.text();
            return new Response(JSON.stringify({ error: `Groq API Error: ${response.status} - ${errorData}` }), { status: response.status });
        }

        const data = await response.json();
        const reading = data.choices[0].message.content.trim();

        // フロントエンドに結果を返す
        return new Response(JSON.stringify({ reading }), {
            headers: { 
                "Content-Type": "application/json;charset=UTF-8"
            }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: `Internal Server Error: ${e.message}` }), { status: 500 });
    }
}
