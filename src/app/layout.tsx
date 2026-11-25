import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvaliaFeira – Sistema de Avaliação de Feira de Ciências",
  description: "Sistema completo, responsivo e em tempo real para avaliação de feiras de ciências escolares e acadêmicas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
