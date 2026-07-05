// Server component: injecte des donnees structurees schema.org (JSON-LD).
// On echappe "<" en < pour eviter toute injection HTML/XSS via les
// champs texte (recommandation officielle Next).
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
