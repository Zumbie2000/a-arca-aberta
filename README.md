# A Arca Aberta — Website

Baseado no manifesto literário de **Ana Maria Machado**: *"Como e Por Que Ler os Clássicos Desde Cedo"*.

---

## 📁 Estrutura de Arquivos

```
classicos_website/
├── index.html          ← Página principal
├── css/
│   └── style.css       ← Estilos (paleta, tipografia, animações)
├── js/
│   ├── main.js         ← Navegação, scroll reveal, menu mobile
│   └── quiz.js         ← Questionário + base de dados local
├── images/
│   ├── image1.png      ← Capa (hero)
│   ├── image2.png      ← Don Quixote / memória
│   ├── image4.png      ← Diagnóstico moderno
│   ├── image5.png      ← Exclusão literária
│   ├── image6.png      ← O clássico como resistência
│   ├── image8.png      ← Erótica do Texto (gráfico)
│   ├── image9.png      ← Violência pedagógica
│   ├── image10.png     ← Modelo ideal (Venn)
│   ├── image12.png     ← Atrito estrutural
│   ├── image13.png     ← Ciclo da formação
│   └── image15.png     ← Encerramento / questionário
└── README.md           ← Este arquivo
```

---

## 🚀 Como Usar

**Abrir localmente:**
Basta abrir o arquivo `index.html` diretamente no navegador (Chrome, Firefox, Edge).
Não precisa de servidor.

**Publicar na internet:**
Faça upload de toda a pasta para qualquer hospedagem estática:
- [GitHub Pages](https://pages.github.com/) (gratuito)
- [Netlify](https://netlify.com/) (gratuito, basta arrastar a pasta)
- [Vercel](https://vercel.com/) (gratuito)

---

## 📊 Base de Dados — Questionário

O questionário **"Qual clássico você vai abrir hoje?"** armazena as respostas no `localStorage` do navegador, com a chave `db_classicos_v1`.

### Exportar respostas como CSV

Abra o Console do Navegador (`F12` → aba **Console**) e cole:

```javascript
const db = JSON.parse(localStorage.getItem('db_classicos_v1'));
const csv = ['Nome,Clássico,Data',
  ...db.responses.map(r => `"${r.name}","${r.book}","${r.timestamp}"`)]
  .join('\n');
const a = document.createElement('a');
a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
a.download = 'respostas_classicos.csv';
a.click();
```

Isso fará o download de `respostas_classicos.csv` com todas as respostas coletadas.

### Estrutura de cada resposta (JSON)

```json
{
  "id": 1710000000000,
  "book": "Dom Quixote",
  "name": "Ana",
  "timestamp": "2025-03-21T10:30:00.000Z"
}
```

### Limpar os dados

Clique no botão **"Limpar base de dados"** na seção do questionário, ou cole no Console:

```javascript
localStorage.removeItem('db_classicos_v1');
```

---

## 🎨 Personalização

### Cores (em `css/style.css`)
```css
:root {
  --navy:  #0e1a2b;   /* fundo escuro */
  --cream: #f5f0e8;   /* fundo claro  */
  --gold:  #c9a84c;   /* destaque     */
  --red:   #7d2027;   /* acento       */
}
```

### Adicionar mais livros ao questionário
Edite `index.html` e adicione um botão na div `.quiz-options`:
```html
<button class="quiz-btn" data-book="Nome do Livro">Nome do Livro</button>
```

### Trocar imagens
Substitua os arquivos em `images/` mantendo os mesmos nomes.

---

## 🌐 Fontes Externas Utilizadas

- **Google Fonts:** Playfair Display, Cormorant Garamond, EB Garamond
- Requer conexão à internet para carregar as fontes (ou baixe e use localmente).

---

## 📝 Créditos

- Conteúdo baseado em: *"A Arca Aberta"* — Ana Maria Machado
- Síntese visual gerada com NotebookLM
- Website desenvolvido com HTML, CSS e JavaScript puro
