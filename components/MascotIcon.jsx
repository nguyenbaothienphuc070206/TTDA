export default function MascotIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="7.2" r="3" stroke="currentColor" strokeWidth="1.6" />

      {/* Glasses (teacher look) */}
      <circle cx="10.8" cy="7.3" r="0.75" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13.2" cy="7.3" r="0.75" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M11.55 7.3h.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8 21v-4.6c0-2.6 1.9-4.8 4.5-4.8S17 13.8 17 16.4V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11.9l2 2.7 2-2.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Coach badge / whistle pendant */}
      <path
        d="M12 10.6v1.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="12" cy="13" r="0.75" stroke="currentColor" strokeWidth="1.3" />

      <path
        d="M8.6 16.7h6.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11.1 17.9l.9.9.9-.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
