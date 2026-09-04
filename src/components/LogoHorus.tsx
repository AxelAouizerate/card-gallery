// OEil d'Horus (Oudjat) aplati, trait lineaire, noir et blanc — remplace
// l'ancien logo photo/degrade, juge trop complexe. Contour uniquement
// (stroke), pas de remplissage, pour rester simple et lisible en petit.
export default function LogoHorus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 70"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Sourcil */}
      <path d="M8 20c10-10 26-14 40-14s28 5 36 13" />
      {/* Paupiere superieure / forme de l'oeil */}
      <path d="M4 30c12-9 26-13 40-13s30 4 42 13c-12 9-27 14-42 14S16 39 4 30Z" />
      {/* Pupille */}
      <circle cx="46" cy="30" r="9" />
      {/* Marque verticale sous l'oeil (larme de faucon) */}
      <path d="M40 44v14" />
      {/* Spirale */}
      <path d="M40 58c-6 0-9-4-9-8s3-6 6-6 5 2 5 5-2 4-4 4" />
      {/* Trait diagonal vers l'exterieur */}
      <path d="M70 34l14 10" />
    </svg>
  );
}
