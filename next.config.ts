import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /photos/* vers le repo GitHub des photos pour masquer l'origine
  // dans le DOM. Le browser voit /photos/NNN_X.jpg, jamais l'URL GitHub.
  async rewrites() {
    return [
      {
        source: "/photos/:path*",
        destination:
          "https://raw.githubusercontent.com/AxelAouizerate/cards-photos/main/:path*",
      },
    ];
  },
};

export default nextConfig;
