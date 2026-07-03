# 📖 Dicionário Inteligente EN → PT

Aplicação de terminal que recebe uma palavra em inglês e retorna sua tradução em português com exemplos, pronúncia e prática imediata via quiz.

# 💡 Ideia

Eu já usava o IA para criar flashcards e praticar palavras novas que descobria em filmes, vídeos ou redes sociais. O problema era o processo manual: pesquisar a tradução, escrever a frase, formatar o cartão para o Anki.

Criei essa ferramenta para automatizar exatamente isso: digita a palavra, recebe o card completo com tradução, pronúncia e exemplos, pratica na hora com o quiz e exporta direto pro Anki.

## 🎯 Objetivo

Ajudar estudantes de inglês a aprenderem novas palavras de forma prática, com exemplos reais de uso e fixação imediata pelo quiz, sem sair do terminal.

## ⚙️ Requisitos
- Node.js 18 ou superior
- Conta no OpenRouter (https://openrouter.ai) com chave de API

## 🚀 Instalação

1. Entre na pasta do projeto:
cd dicionario-en

2. Instale as dependências:
npm install

3. Crie o arquivo .env baseado no .env:
OPENROUTER_API_KEY=sua_chave_aqui

⚠️ Nunca compartilhe sua chave. Não suba o .env pro GitHub.

## Como executar
npm start

## Como usar
1. Digite uma palavra em inglês no terminal
2. Veja o card com tradução, pronúncia e exemplos
3. Escolha o que fazer:
   1. Fazer quiz
   2. Exportar pro Anki
   3. Pesquisar outra palavra
   4. Sair

## Exportar pro Anki — Flashcards com Repetição Espaçada

O Anki (https://apps.ankiweb.net) é um aplicativo gratuito de flashcards (cartões de memória) baseado em repetição espaçada — uma técnica cientificamente comprovada que mostra cada cartão exatamente no momento em que você está prestes a esquecer a informação.

O objetivo é facilitar a memorização a longo prazo de grandes quantidades de informação com o mínimo de esforço por sessão de estudo.

Formato exportado:
frase_ingles;traducao_frase;traducao_palavra;som_aproximado

Para importar no Anki:
1. Baixe o Anki em https://apps.ankiweb.net (gratuito)
2. Abra o Anki → Arquivo → Importar
3. Selecione o arquivo anki/exportados.txt
4. Configure o separador como ponto e vírgula (;)
5. Pronto — seus cartões estarão prontos para revisar!

