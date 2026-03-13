# 🎓 FagAI – Din Læringsassistent

FagAI er et AI-drevet læringsværktøj til danske skoleelever. Det hjælper med at forstå fag, organisere noter og brainstorme idéer til opgaver – **uden nogensinde at skrive opgaver for eleven**.

---

## ✨ Funktioner

- 💬 **AI-chat** via OpenAI GPT-4o mini (nem opgradering til Claude)
- 📚 **Fag-fokus** – matematik, dansk, engelsk, programmering, naturfag, historie m.fl.
- 📝 **Notestyring** – opret, rediger og organiser noter efter fag
- 💡 **Idé-bank** – hurtige spørgsmål til inspiration
- 🛡️ **Sikker AI** – systemet er designet til at lære, ikke snyde

---

## 🚀 Kom i gang

### 1. Klon projektet

```bash
git clone https://github.com/DIT-BRUGERNAVN/fagai.git
cd fagai
```

### 2. Installer afhængigheder

```bash
npm install
```

### 3. Start udviklingsserveren

```bash
npm run dev
```

Åbn [http://localhost:5173](http://localhost:5173) i din browser.

### 4. Indsæt din OpenAI API-nøgle

Øverst i appen er der et felt til din API-nøgle. Indsæt din nøgle fra [platform.openai.com](https://platform.openai.com/api-keys).

> ⚠️ **Vigtigt:** Del aldrig din API-nøgle offentligt. Commit den aldrig til GitHub.

---

## 🔧 Byg til produktion

```bash
npm run build
```

Output-filerne placeres i `dist/` mappen og kan deployes til fx [Vercel](https://vercel.com) eller [Netlify](https://netlify.com).

---

## 🔄 Skift til Claude API

Når du vil opgradere fra OpenAI til Anthropic Claude, find denne linje i `src/App.jsx`:

```js
const res = await fetch("https://api.openai.com/v1/chat/completions", {
```

Og udskift med Anthropic's endpoint og format (se Anthropic docs).

---

## 🗂️ Projektstruktur

```
fagai/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # Hele applikationen
│   └── main.jsx       # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📄 Licens

MIT – fri til brug og videreudvikling.
