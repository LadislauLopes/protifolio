# Portfólio de Ladislau Lopes

Site pessoal de Ladislau Lopes da Silva Júnior, desenvolvedor Python pleno em Rio Branco (AC):
IA generativa com RAG, pipelines de dados e automação para o Judiciário.

## Como rodar

Abra o `index.html` no navegador. Não tem build nem dependência.

Para testar como ficará publicado (caminhos relativos, fontes e PDFs):

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Publicação

Cada push na `main` publica o site no GitHub Pages pelo workflow
`.github/workflows/pages.yml`. Ele monta só `index.html` e `assets/`, confere se todo arquivo
referenciado no HTML e no CSS existe (se faltar algum, o deploy para) e publica. Dá para rodar
à mão em **Actions → Publicar no GitHub Pages → Run workflow**.

Uma vez só, no GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Endereço: <https://ladislaulopes.github.io/protifolio/>

## Como a página funciona

Uma página curta (umas 6 telas) que diz o essencial:

1. **Abertura:** nome, cargo, uma frase e o **combo jogável** ao lado. Cada golpe é uma etapa da
   plataforma de automação, na ordem real (uf4 Airflow, 4 Docker, f,F+3 Selenoid, b1,2 Python,
   f3+4,2 pandas, 2 PostgreSQL, f,f,F+2+4 Google Chat). Com o controle em foco: setas ou
   W A S D na alavanca e U I J K ou 1 a 4 nos botões; no celular, a tela. A demonstração roda
   sozinha uma vez (menos com movimento reduzido). As regras ficam em `STEPS`, no `scripts.js`.
2. **No Tribunal de Justiça:** três destaques com diagrama (plataforma de automação, chatbot com
   RAG, CI/CD e infraestrutura) e o resto numa linha.
3. **Fora do expediente:** Arcade Builder, Guia de Tekken 8, Homelab e uma lista curta.
4. **Trajetória:** linha do tempo e ferramentas, uma linha por área.
5. **Fechamento:** contato, os três currículos em PDF e a recomendação da Polícia Federal.

Identidade: a mesma do perfil do GitHub. Fundo azul-noite, branco frio do monitor e o âmbar da
lâmpada como destaque. Um tema só, escuro. Sem JavaScript, tudo aparece e o combo fica completo.

## Estrutura

```
index.html
assets/
  css/     reset.css e styles.css (tokens no topo)
  js/      scripts.js (revelação ao rolar e o combo jogável)
  fonts/   Space Grotesk e Inter (subconjuntos woff2) e a licença OFL
  images/  render do Arcade Builder e print do Guia de Tekken 8
  docs/    currículos em PDF e a declaração da Polícia Federal
```

## Sigilo

Os sistemas do Tribunal são internos. A página descreve o problema, a arquitetura e a stack de
cada um, sem nomes internos, endereços, telas ou dados. Os diagramas são desenhos feitos para o
site, não capturas.

## Créditos

- Tipos: Space Grotesk e Inter, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
