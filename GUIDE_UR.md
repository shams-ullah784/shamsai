# ShamsAI: A se Z tak Step-by-Step Guide (Roman Urdu)

Yeh guide bilkul shuru se hai. Har step ko order mein karein. Koi step skip na karein.

---

## Step 0: Pehle yeh cheezein chahiye

| Cheez | Kahan se | Kyun chahiye |
|---|---|---|
| Node.js (LTS version) | https://nodejs.org | App chalane ke liye |
| Git | https://git-scm.com | Code GitHub par bhejne ke liye |
| VS Code | https://code.visualstudio.com | Code dekhne aur edit karne ke liye |
| GitHub account | https://github.com | Code online rakhne ke liye |
| Google account | gmail.com | Firebase ke liye |
| Anthropic API key | https://console.anthropic.com | AI ke jawab dene ke liye |

---

## Step 1: Project folder kholein

1. `shamsai` folder ko VS Code mein kholein (File > Open Folder).
2. VS Code mein Terminal kholein (Terminal > New Terminal).
3. Yeh command chalayein:

```bash
npm install
```

Thori der lagegi. Jab khatam ho to `node_modules` folder ban chuka hoga.

---

## Step 2: AI key lena (Anthropic)

1. https://console.anthropic.com par account banayein.
2. **Billing** mein thore credits add karein (AI ke jawab paid hain).
3. **API Keys** > **Create Key** par click karein.
4. Key copy kar lein. Yeh sirf ek baar dikhti hai.

---

## Step 3: Firebase project banana (login aur data ke liye)

1. https://console.firebase.google.com par jayein.
2. **Create a project** dabayein. Naam likhein: `shamsai`. Google Analytics band kar sakte hain.
3. Project khulne ke baad, shuru mein **Web icon (`</>`)** dabayein. App ka naam `shamsai-web` likhein, **Register app** dabayein.
4. Aap ko ek `firebaseConfig` dikhega. Is mein se yeh 4 cheezein copy karein: `apiKey`, `authDomain`, `projectId`, `appId`.

### Google login on karein

1. Left menu: **Build > Authentication > Get started**.
2. **Sign-in method** tab > **Google** > **Enable**.
3. Support email chunein aur **Save** karein.

### Apple login (baad mein, optional)

Apple login ke liye **Apple Developer Program** chahiye (taqreeban 99 USD saalana). Is ke baghair Apple button kaam nahi karega. Pehle Google login chalayein, Apple baad mein add kar sakte hain:

1. Firebase: **Authentication > Sign-in method > Apple > Enable**.
2. Apple Developer account mein Services ID, Key aur Team ID banayein, aur Firebase ke diye hue "callback URL" ko Apple ki settings mein daalein.
3. Firebase ke Apple form mein Services ID, Team ID, Key ID aur private key bharein. Detail yahan hai: https://firebase.google.com/docs/auth/web/apple

### Database on karein (chats ke liye)

1. **Build > Firestore Database > Create database**.
2. Location chunein (jo aap ke qareeb ho). **Production mode** chunein. **Enable** dabayein.
3. **Rules** tab kholein. Jo likha hai sab mita dein, aur project ki `firestore.rules` file ka poora content paste karein. **Publish** dabayein.

Yeh rules ka kaam hai ke har banda sirf apni chats dekh sake. Yeh step bohat zaroori hai.

### Server key (token check karne ke liye)

1. **Project settings** (gear icon) > **Service accounts** tab.
2. **Generate new private key** dabayein. Ek `.json` file download hogi.
3. Is file mein se `client_email` aur `private_key` chahiye honge.

> Yeh JSON file kisi ko na dein aur GitHub par kabhi upload na karein.

---

## Step 4: Keys ko `.env.local` mein daalna

1. Project mein `.env.example` ki copy banayein aur naam rakhein `.env.local`.
2. Sab values bharein:

```
ANTHROPIC_API_KEY=aap_ki_anthropic_key
ANTHROPIC_MODEL=claude-haiku-5-5

NEXT_PUBLIC_FIREBASE_API_KEY=apiKey_yahan
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=authDomain_yahan
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projectId_yahan
NEXT_PUBLIC_FIREBASE_APP_ID=appId_yahan

FIREBASE_CLIENT_EMAIL=client_email_yahan
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PRIVATE_KEY` ko quotes ke andar rakhein aur `\n` waise hi rehne dein jaise JSON mein hain.

---

## Step 5: App chalana

```bash
npm run dev
```

Browser mein kholein: http://localhost:3000

Ab "Continue with Google" dabayein, login karein aur kuch poochein. Jawab tezi se likhta hua aana chahiye. Dark/light ka button neeche left mein aap ke naam ke saath hai.

---

## Step 6: GitHub par push karna

1. https://github.com/new par jayein. Repository name: `shamsai`. **Public** rakhein. README ya .gitignore na chunein (woh pehle se project mein hain). **Create repository** dabayein.
2. VS Code terminal mein (har line ke baad Enter):

```bash
git init
git add .
git commit -m "Initial commit: ShamsAI"
git branch -M main
git remote add origin https://github.com/AAPKA_USERNAME/shamsai.git
git push -u origin main
```

`AAPKA_USERNAME` ki jagah apna GitHub username likhein.

3. Check karein ke `.env.local` GitHub par upload **nahi** hui. Woh `.gitignore` ki wajah se nahi jani chahiye.

### Repository ko VIP dikhane ke tareeqe

- Repository ki **About** mein description likhein aur topics lagayein: `ai`, `chatbot`, `nextjs`, `firebase`.
- Chalte hue app ki 2 screenshots (dark aur light) `docs/` folder mein daal kar README mein lagayein.
- Deploy karke live link README ke upar daal dein.

---

## Step 7: Online daalna (Vercel, free)

1. https://vercel.com par GitHub se login karein.
2. **Add New > Project** > apni `shamsai` repository chunein > **Import**.
3. **Environment Variables** mein `.env.local` ki saari values ek ek karke daalein.
4. **Deploy** dabayein.
5. Jo link mile (jaise `shamsai.vercel.app`), usay Firebase mein **Authentication > Settings > Authorized domains** mein add karein. Warna login nahi chalega.

---

## Agar masla aaye

| Masla | Hal |
|---|---|
| "This website address is not allowed yet" | Firebase Authorized domains mein apna domain add karein |
| "Google sign-in is not turned on" | Firebase Authentication mein Google ko Enable karein |
| "ANTHROPIC_API_KEY is missing" | `.env.local` check karein, phir `npm run dev` dobara chalayein |
| Jawab nahi aata / 401 error | `FIREBASE_CLIENT_EMAIL` aur `FIREBASE_PRIVATE_KEY` dobara check karein |
| Chats save nahi hotin | Firestore Rules publish kiye hain ya nahi, check karein |
| Apple login nahi chalta | Apple Developer account aur Firebase Apple settings poori karein |

---

## Agla kaam (jab chahein)

Chat search, rename, voice input, image upload, aur model chunne ka option. Jab kisi ek par kaam karna ho, bata dein.
