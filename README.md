# ShamsAI

A fast, private AI assistant with a 3D solar interface.
Sign in with Google or Apple, and every person's chats stay in their own account.

## Features

- **Fast streaming replies.** Answers appear word by word as they are written. Defaults to a speed-tuned model.
- **Google and Apple sign-in** through Firebase Authentication.
- **Private by design.** Chats are stored per user, and Firestore security rules allow only the owner to read or write them. The AI endpoint rejects requests without a valid sign-in token.
- **Dark ("Eclipse") and light ("Noon") themes.** Follows the system setting on first visit, remembers your choice, and loads without a flash.
- **3D interface.** A glowing sun orb with orbiting rings that tilts toward your pointer and speeds up while the AI is thinking.
- **Markdown answers** with lists and code blocks, a Stop button, chat history, and a layout that works on phones.
- **Respects reduced-motion settings** and has visible keyboard focus.

## Tech stack

Next.js (App Router) · React · Firebase Auth + Firestore · Firebase Admin · Anthropic API · plain CSS design tokens

## Quick start

```bash
git clone https://github.com/<your-username>/shamsai.git
cd shamsai
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev
```

Open http://localhost:3000.

Without Firebase keys the login screen shows a **dev-only** guest button so you can try the interface. Guest chats are saved in your browser only. Guest mode is disabled in production.

For a full step-by-step setup, read [GUIDE_UR.md](./GUIDE_UR.md) (Roman Urdu).

## Project structure

```
app/
  api/chat/route.js   Streams AI replies; verifies the user's Firebase token
  layout.js           Fonts, theme script, providers
  page.js             Login screen or chat, depending on sign-in state
  globals.css         Design tokens for both themes, orb, layout
components/           ChatApp, LoginScreen, Orb, ThemeToggle, Providers, Icons
lib/                  Firebase client/admin setup and per-user chat storage
firestore.rules       Only the owner can read or write their chats
```

## Security notes

- `ANTHROPIC_API_KEY` and the Firebase service account live on the server only. Never commit `.env.local` (it is in `.gitignore`).
- Publish `firestore.rules` before going live. Without it, Firestore will not protect users' data.
- Apple sign-in requires an Apple Developer Program membership.

## Roadmap

- Image and file attachments
- Chat search and rename
- Voice input
- Model picker

## License

MIT
