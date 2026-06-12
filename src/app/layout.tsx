import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { FavoritesProvider } from "@/lib/favorites";
import Tracker from "@/components/Tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel_Decorative({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const SITE_URL = "https://horuscards.fr";
const SITE_NAME = "horuscards";
const DESCRIPTION =
  "horuscards — boutique de cartes Yu-Gi-Oh! à l'unité : magicien sombre, dragon blanc aux yeux bleus, néos, gradées CCC/PSA, 1ère édition, secret/ultimate/ghost. Photos sur demande, lots négociables, livraison rapide.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "horuscards — Cartes Yu-Gi-Oh à l'unité",
    template: "%s · horuscards",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Yu-Gi-Oh", "YuGiOh", "YGO", "cartes à collectionner", "TCG",
    "1ère édition", "secret rare", "ultimate rare", "ghost rare",
    "magicien sombre", "dragon blanc aux yeux bleus", "néos",
    "carte gradée", "CCC", "PSA", "collectaura", "boutique en ligne",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [{ url: "/horus-logo.png", sizes: "any" }],
    apple: "/horus-logo.png",
    shortcut: "/horus-logo.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "horuscards — Cartes Yu-Gi-Oh à l'unité",
    description: DESCRIPTION,
    locale: "fr_FR",
    images: [{
      url: "/horus-logo.png",
      width: 800, height: 800,
      alt: "Logo horuscards (Slifer le dragon céleste)",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "horuscards — Cartes Yu-Gi-Oh à l'unité",
    description: DESCRIPTION,
    images: ["/horus-logo.png"],
  },
  themeColor: "#0e0a18",
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <FavoritesProvider>
            <Tracker />
            {children}
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
