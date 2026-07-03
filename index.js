import "dotenv/config";
import readline from "readline";

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-oss-120b:free";

if (!API_KEY) {
    console.error("Erro: crie o arquivo .env com OPENROUTER_API_KEY.");
    process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function chamarLLM() {
    const palavraIngles = await question("Digite uma palavra em inglês: ");
    rl.close();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-OpenRouter-Title": "Atividade FIA ADS"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "Você é um dicionário inteligente inglês → português. Quando o usuário enviar uma palavra em inglês, responda APENAS com um JSON válido, sem texto fora do JSON, sem markdown, sem explicações. Nunca invente traduções. Nunca saia do formato JSON."
                },
                {
                    role: "user",
                    content: palavraIngles
                }
            ],
            temperature: 0.3,
            max_completion_tokens: 700
        })
    });

    if (!response.ok) {
        const detalhe = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${detalhe}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error("A API respondeu, mas nao retornou texto.");
    }

    console.log("\nResposta da IA:\n");
    console.log(text);
}

chamarLLM().catch((error) => {
    console.error("Falha ao chamar o OpenRouter:");
    console.error(error.message);
});
