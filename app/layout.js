import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "ShamsAI - your private AI assistant",
  description: "A fast, private AI assistant. Sign in with Google or Apple and keep your chats to yourself.",
  icons: { icon: "/logo.svg" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b14" },
    { media: "(prefers-color-scheme: light)", color: "#f2f5ff" },
  ],
};

// Runs before first paint so there is no dark/light flash.
const themeScript = `(function(){try{var t=localStorage.getItem('shamsai-theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="ambient" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
