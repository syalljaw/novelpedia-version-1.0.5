import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Novelpedia Retro - JRPG Novel Portal',
  description: 'Retro JRPG style layout for reading and writing light novels with AI modules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 font-family=%22sans-serif%22>N</text></svg>" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var prefs = JSON.parse(localStorage.getItem('novelpedia_prefs') || '{}');
              var root = document.documentElement;
              if (prefs.theme === 'dark' || (prefs.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                root.classList.add('dark');
              }
              if (prefs.fontSize && prefs.fontSize !== "16") {
                root.style.fontSize = prefs.fontSize + 'px';
              }
              if (prefs.highContrast) root.classList.add('high-contrast');
              if (prefs.reduceMotion) root.classList.add('reduce-motion');
            } catch(e) {}
          `
        }} />
      </head>
      <body className="min-h-screen bg-slate-900 flex justify-center text-slate-900 selection:bg-indigo-600 selection:text-white">
        <div className="w-full max-w-[430px] bg-slate-50 min-h-screen shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-x-hidden flex flex-col border-x border-slate-800/50">
          {children}
        </div>
      </body>
    </html>
  );
}
