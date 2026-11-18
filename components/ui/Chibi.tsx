/**
 * CHIBI, the small drawing of me at a laptop.
 * ------------------------------------------------------------------------
 * A developer mid-keystroke, sunglasses down, drawn as SVG in the same
 * language as the rest of the site: thick ink outline, flat crayon fills, no
 * gradients, no bitmaps, nothing to load.
 *
 * Every colour here is FIXED, not a theme token. An illustration is an object
 * on the page, not part of its interface: if the outline flipped to cream in
 * dark mode, a cream line on cream skin would disappear. Fixed colours keep it
 * looking the same and staying legible in both themes, which is why a drawing
 * of a person should not theme itself.
 *
 * Decorative, so it is aria-hidden. The name and role beside it carry meaning.
 */
export function Chibi({
  className = "",
  title,
}: {
  className?: string;
  /** Optional accessible title. Omit for pure decoration. */
  title?: string;
}) {
  const INK = "#16130f";
  const SKIN = "#efc9a0";
  const HAIR = "#16130f";
  const SHIRT = "#0e7c5b";
  const CREAM = "#fff3df";
  const SCREEN = "#0f0d0a";
  const TANG = "#ff6b35";

  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      fill="none"
    >
      {title ? <title>{title}</title> : null}

      {/* Keyboard forearm and laptop, behind the body */}
      <g>
        {/* the lid, tilted back */}
        <path
          d="M66 158 L72 118 a6 6 0 0 1 6-5 h44 a6 6 0 0 1 6 5 l6 40 z"
          fill={CREAM}
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* screen */}
        <path
          d="M74 153 L79 121 h42 l5 32 z"
          fill={SCREEN}
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* code, three lines, in the site's own colours */}
        <g strokeWidth="4" strokeLinecap="round">
          <path d="M86 130 h12" stroke={SHIRT} />
          <path d="M86 138 h24" stroke={TANG} />
          <path d="M86 146 h17" stroke={CREAM} />
        </g>
      </g>

      {/* Head */}
      <g>
        {/* neck */}
        <path d="M93 76 v10 h14 v-10" fill={SKIN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        {/* head */}
        <path
          d="M64 44 C64 20 82 8 100 8 c18 0 36 12 36 36 c0 22-14 38-36 38 C78 82 64 66 64 44 z"
          fill={SKIN}
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* hair: a cropped block with a soft fringe */}
        <path
          d="M62 42 C59 16 80 3 100 3 c20 0 41 13 38 39 c-5-9-13-13-21-12 c-5 6-15 9-25 8 c-8-1-17-2-23 4 z"
          fill={HAIR}
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Sunglasses: two distinct lenses, a bridge, temple arms. */}
        <g>
          <rect x="68" y="38" width="27" height="17" rx="7" fill="#1d1a15" stroke={INK} strokeWidth="4" />
          <rect x="105" y="38" width="27" height="17" rx="7" fill="#1d1a15" stroke={INK} strokeWidth="4" />
          <path d="M95 45 h10" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M68 44 h-6" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M132 44 h6" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          {/* a glint in each lens, so they read as glass and not a blindfold */}
          <path d="M75 42.5 l6 0" stroke={CREAM} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M112 42.5 l6 0" stroke={CREAM} strokeWidth="3.2" strokeLinecap="round" />
        </g>

        {/* pleased, concentrating mouth */}
        <path d="M93 65 q7 5 14 0" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Body and arms, over the laptop lid so he is leaning in */}
      <g>
        <path
          d="M60 122 C56 94 74 84 100 84 c26 0 44 10 40 38 z"
          fill={SHIRT}
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* sleeves */}
        <path d="M62 108 C50 122 52 142 62 156" stroke={SHIRT} strokeWidth="13" strokeLinecap="round" />
        <path d="M138 108 C150 122 148 142 138 156" stroke={SHIRT} strokeWidth="13" strokeLinecap="round" />
        <path d="M62 108 C50 122 52 142 62 156" stroke={INK} strokeWidth="4" strokeLinecap="round" opacity="0" />
        {/* hands, resting on the base */}
        <circle cx="62" cy="160" r="8.5" fill={SKIN} stroke={INK} strokeWidth="4" />
        <circle cx="138" cy="160" r="8.5" fill={SKIN} stroke={INK} strokeWidth="4" />
      </g>

      {/* Laptop base */}
      <g>
        <path
          d="M48 166 h104 a8 8 0 0 1 8 8 v3 a5 5 0 0 1-5 5 H45 a5 5 0 0 1-5-5 v-3 a8 8 0 0 1 8-8 z"
          fill={CREAM}
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M91 174 h18" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* A mug, and a tick, both inside the frame */}
      <g>
        <rect x="158" y="140" width="20" height="20" rx="4" fill={TANG} stroke={INK} strokeWidth="4" />
        <path d="M178 146 h5 a6 6 0 0 1 0 11 h-5" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M164 134 c4-5 -2-8 2-13" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M172 134 c4-5 -2-8 2-13" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* shipped */}
      <path
        d="M18 140 l9 10 l16-21"
        stroke={SHIRT}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
