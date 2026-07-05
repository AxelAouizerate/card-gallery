import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { FavoritesProvider } from "@/lib/favorites";
import Tracker from "@/components/Tracker";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/site";

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

const TITLE_DEFAULT =
  "horuscards — Cartes Yu-Gi-Oh! françaises à l'unité (éditions FR & inédits)";
const DESCRIPTION = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE_DEFAULT,
    template: "%s · horuscards — cartes Yu-Gi-Oh! FR",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { "fr-FR": SITE_URL, "x-default": SITE_URL },
  },
  icons: {
    icon: [{ url: "/horus-logo.png", sizes: "any" }],
    apple: "/horus-logo.png",
    shortcut: "/horus-logo.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    locale: "fr_FR",
    images: [{
      url: "/horus-logo.png",
      width: 800, height: 800,
      alt: "horuscards — cartes Yu-Gi-Oh! françaises, éditions FR rares et inédits",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_DEFAULT,
    description: DESCRIPTION,
    images: ["/horus-logo.png"],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

// Donnees structurees valables sur tout le site : la boutique + le site web.
const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE_URL}/#store`,
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/horus-logo.png`,
  logo: `${SITE_URL}/horus-logo.png`,
  description: DESCRIPTION,
  priceRange: "€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Carte bancaire, PayPal, Virement",
  knowsLanguage: ["fr-FR"],
  areaServed: { "@type": "Country", name: "France" },
  slogan: "Cartes Yu-Gi-Oh! françaises, éditions rares et inédits pour duellistes et collectionneurs.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "fr-FR",
  description: DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#store` },
};

export const viewport: Viewport = {
  themeColor: "#0e0a18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={storeJsonLd} />
        <JsonLd data={websiteJsonLd} />
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
