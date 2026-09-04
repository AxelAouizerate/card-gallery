import { ANNONCES } from "@/lib/annonces";

const INSTAGRAM = "https://www.instagram.com/horus_et_madrid/";
const TIKTOK = "https://www.tiktok.com/@horus_et_madrid";

// Bandeau fin au-dessus du header : annonces (rachat, trade, receptions,
// lives...) + liens reseaux sociaux. Toujours visible, sur toutes les pages
// (rendu dans HeaderNav).
export default function BandeauAnnonces() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-1.5 text-center text-xs font-medium text-amber-100/90 sm:justify-between">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {ANNONCES.map((msg, i) => (
            <span key={i}>{msg}</span>
          ))}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-amber-100/70 transition hover:text-amber-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.24-1.97.4-2.43A4.9 4.9 0 0 1 3.82 3a4.9 4.9 0 0 1 1.77-1.15c.46-.16 1.26-.35 2.43-.4C9.27 2.21 9.67 2.2 12 2.2Zm0 1.8c-3.15 0-3.52 0-4.77.07-.96.04-1.48.2-1.82.33-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.13.34-.29.86-.33 1.82C3.14 8.48 3.13 8.85 3.13 12s0 3.52.07 4.77c.04.96.2 1.48.33 1.82.18.46.4.79.74 1.13.34.34.67.56 1.13.74.34.13.86.29 1.82.33 1.25.06 1.62.07 4.77.07s3.52 0 4.77-.07c.96-.04 1.48-.2 1.82-.33.46-.18.79-.4 1.13-.74.34-.34.56-.67.74-1.13.13-.34.29-.86.33-1.82.06-1.25.07-1.62.07-4.77s0-3.52-.07-4.77c-.04-.96-.2-1.48-.33-1.82a3.09 3.09 0 0 0-.74-1.13 3.09 3.09 0 0 0-1.13-.74c-.34-.13-.86-.29-1.82-.33C15.52 4 15.15 3.99 12 3.99Zm0 3.06a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9Zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Zm5.15-1.99a1.16 1.16 0 1 1-2.31 0 1.16 1.16 0 0 1 2.31 0Z"/>
            </svg>
          </a>
          <a
            href={TIKTOK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-amber-100/70 transition hover:text-amber-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6 2h-3.2v13.4a3.1 3.1 0 1 1-2.2-2.97v-3.3a6.3 6.3 0 1 0 5.4 6.24V8.6a7.9 7.9 0 0 0 4.6 1.47V6.87a4.6 4.6 0 0 1-4.6-4.6V2Z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
