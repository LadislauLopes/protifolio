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

- **Metade fixa (desktop):** a coluna da esquerda rola com o texto; a da direita mostra a imagem
  da seção ativa (foto, diagrama, print ou documento). Em telas estreitas tudo fica numa coluna só.
- **Sem JavaScript:** as figuras ficam no fluxo e os projetos abertos.

## Estrutura

```
index.html
assets/
  css/     reset.css e styles.css (tokens no topo)
  js/      scripts.js (palco, projetos, abas e contato)
  fonts/   STIX Two Text (woff2) e a licença OFL
  images/  fotos e documentos impressos em azul (duotone)
  docs/    currículos em PDF e a declaração da Polícia Federal
```

## Sigilo

Os sistemas do Tribunal são internos. A página descreve o problema, a arquitetura e a stack de
cada um, sem nomes internos, endereços, telas ou dados. Os diagramas são desenhos feitos para o
site, não capturas.

## Créditos

- Fotos de Rio Branco: MTur Destinos (Assis Lima e Marco Vicentti), domínio público, via
  Wikimedia Commons. Links na linha de créditos do rodapé.
- Tipo: STIX Two Text, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
