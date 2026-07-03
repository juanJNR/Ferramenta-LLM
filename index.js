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
                    content: `Você é um dicionário inteligente inglês → português.
Quando o usuário enviar uma palavra em inglês, responda APENAS com um JSON válido, sem texto fora do JSON, sem markdown, sem explicações.

O JSON deve seguir exatamente este formato:
{
  "palavra_ingles": "a palavra em inglês",
  "palavra_portugues": "a tradução em português",
  "classe_gramatical": "substantivo | verbo | adjetivo | etc",
  "som_aproximado": "como pronunciar em português aproximado, ex: apset para upset",
  "frases": [
    {
      "contexto": "descrição curta do contexto",
      "frase_ingles": "frase em inglês com a palavra destacada entre ** **",
      "frase_portugues": "tradução da frase em português"
    },
    {
      "contexto": "descrição curta do contexto",
      "frase_ingles": "frase em inglês com a palavra destacada entre ** **",
      "frase_portugues": "tradução da frase em português"
    }
  ],
  "familia": {
    "substantivo": "palavra ou null",
    "verbo": "palavra ou null",
    "adjetivo": "palavra ou null"
  },
  "quiz": {
    "tipo": "lacuna",
    "pergunta": "frase em inglês com ___ no lugar da palavra",
    "opcoes": ["palavra correta", "errada1", "errada2", "errada3"],
    "resposta_correta": 0
  }
}

REGRAS IMPORTANTES:
- Todas as frases de exemplo devem ser em inglês nível básico (A1/A2): curtas, simples, vocabulário cotidiano, sem gramática complexa.
- Nunca invente traduções.
- Nunca saia do formato JSON.`
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

    const card = JSON.parse(text);
    const SEP = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    console.log('\n' + SEP);
    console.log(`📖 PALAVRA: ${card.palavra_ingles} (${card.classe_gramatical})`);
    console.log(`🔊 Som: ${card.som_aproximado}`);
    console.log(SEP);
    card.frases.forEach((f, i) => {
        console.log(`\n📝 Frase ${i + 1} (${f.contexto}):`);
        console.log(`EN: ${f.frase_ingles}`);
        console.log(`PT: ${f.frase_portugues}`);
    });
    console.log('\n' + SEP);
    console.log('👨‍👩‍👧 Família:');
    console.log(`  substantivo: ${card.familia.substantivo ?? '—'}`);
    console.log(`  verbo: ${card.familia.verbo ?? '—'}`);
    console.log(`  adjetivo: ${card.familia.adjetivo ?? '—'}`);
    console.log(SEP);
}

chamarLLM().catch((error) => {
    console.error("Falha ao chamar o OpenRouter:");
    console.error(error.message);
});
