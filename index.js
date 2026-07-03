import "dotenv/config";
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-oss-120b:free";

if (!API_KEY) {
    console.error("Erro: crie o arquivo .env com OPENROUTER_API_KEY.");
    process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function gerarPergunta(palavraIngles, palavraPortugues) {
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
                    content: `Você é um gerador de quiz para um app de aprendizado de inglês.
Gere uma pergunta de quiz sobre a palavra '${palavraIngles}' (português: '${palavraPortugues}').
Responda APENAS com um JSON válido, sem texto fora do JSON.

Escolha aleatoriamente um destes 3 tipos:

Tipo 1 - Preencher a lacuna:
{"tipo":"lacuna","pergunta":"frase em inglês com ___ no lugar da palavra (nível A1/A2)","opcoes":["palavra correta","errada1","errada2","errada3"],"resposta_correta":0}

Tipo 2 - Verdadeiro ou Falso:
{"tipo":"verdadeiro_falso","pergunta":"uma afirmação sobre a palavra, verdadeira ou falsa","opcoes":["Verdadeiro","Falso"],"resposta_correta":0}

Tipo 3 - Tradução de múltipla escolha:
{"tipo":"traducao","pergunta":"Qual a tradução correta de ${palavraIngles}?","opcoes":["tradução correta","errada1","errada2","errada3"],"resposta_correta":0}

IMPORTANTE: Todas as frases devem ser em inglês nível básico (A1/A2).`
                },
                { role: "user", content: palavraIngles }
            ],
            temperature: 0.7,
            max_completion_tokens: 300
        })
    });
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

async function fazerQuiz(card, palavraIngles, palavraPortugues) {
    const SEP = '━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    let questaoAtual = card.quiz;

    for (let i = 1; i <= 5; i++) {
        if (i > 1) {
            console.log('\n⏳ Gerando pergunta...');
            try {
                questaoAtual = await gerarPergunta(palavraIngles, palavraPortugues);
            } catch {
                console.log('❌ Erro ao gerar pergunta, pulando...');
                continue;
            }
        }

        console.log('\n' + SEP);
        console.log(`❓ QUIZ — Pergunta ${i} de 5`);
        console.log(SEP);
        console.log(`\n${questaoAtual.pergunta}\n`);
        questaoAtual.opcoes.forEach((op, idx) => console.log(`${idx + 1}. ${op}`));

        const resposta = await question('\nDigite sua resposta: ');
        const indice = parseInt(resposta.trim()) - 1;

        if (indice === questaoAtual.resposta_correta) {
            console.log('✅ Correto!');
        } else {
            console.log(`❌ Incorreto. A resposta certa era ${questaoAtual.opcoes[questaoAtual.resposta_correta]}.`);
        }

        if (i < 5) {
            const nav = await question('\n[ Pressione ENTER para próxima pergunta ou Q para voltar ao menu ] ');
            if (nav.trim().toUpperCase() === 'Q') break;
        }
    }
}

async function mostrarMenu() {
    const SEP = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    console.log('\n' + SEP);
    console.log('O que você quer fazer?');
    console.log('1. Fazer quiz');
    console.log('2. Exportar pro Anki');
    console.log('3. Pesquisar outra palavra');
    console.log('4. Sair');
    console.log(SEP);
    return question('Escolha: ');
}

async function chamarLLM() {
    while (true) {
    const palavraIngles = await question("Digite uma palavra em inglês: ");

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

    while (true) {
        const opcao = await mostrarMenu();
        if (opcao === '1') {
            await fazerQuiz(card, palavraIngles, card.palavra_portugues);
        } else if (opcao === '2') {
            const ankiDir = path.join(__dirname, 'anki');
            fs.mkdirSync(ankiDir, { recursive: true });
            const frase = card.frases[0];
            const linha = `${frase.frase_ingles};${frase.frase_portugues};${card.palavra_portugues};${card.som_aproximado}\n`;
            fs.appendFileSync(path.join(ankiDir, 'exportados.txt'), linha, 'utf8');
            console.log('✅ Palavra exportada para anki/exportados.txt');
        } else if (opcao === '3') {
            break;
        } else if (opcao === '4') {
            console.log('Até logo! 👋');
            rl.close();
            process.exit(0);
        }
    }
    } 
}

chamarLLM().catch((error) => {
    console.error("Falha ao chamar o OpenRouter:");
    console.error(error.message);
});
