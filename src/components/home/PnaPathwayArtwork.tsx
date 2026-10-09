type ArtworkKind = "learn" | "practice" | "professional" | "care";

/** Scalable, low-weight clinical art. All depicted patients are male. */
export function PnaPathwayArtwork({kind,className=""}:{kind:ArtworkKind;className?:string}) {
  return (
    <svg className={className} viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label={kind==="learn"?"Medical learning books and clinical science illustration":kind==="practice"?"Clinical reasoning illustration":kind==="professional"?"Male physiotherapist demonstrating a technique with a male patient":"Male physiotherapist caring for a male patient"}>
      <circle cx="211" cy="111" r="104" fill="#b2f0f8" opacity=".48"/>
      <circle cx="211" cy="111" r="88" stroke="#55bcd0" strokeWidth="1.6" strokeDasharray="5 7" fill="none" opacity=".7"/>
      <path d="M115 194h199M196 18v198" stroke="#0e97b5" strokeWidth="1" opacity=".19"/>
      {kind==="learn" && <g>
        {/* Decorative learning illustration: a book, not an anatomical claim. */}
        <circle cx="229" cy="88" r="42" fill="#f3fdff" stroke="#2d9db4" strokeWidth="2.5"/>
        <path d="M229 62v51M204 88h50" stroke="#0e9e9e" strokeWidth="10" strokeLinecap="round"/>
        <path d="M86 134q56-22 112 1v71q-51-23-112-7Z" fill="#effdff" stroke="#238db1" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M198 135q52-24 110-2v69q-55-20-110 4Z" fill="#dcf6ff" stroke="#238db1" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M198 136v70" stroke="#0b789f" strokeWidth="4" strokeLinecap="round"/>
        <path d="M102 150q35-11 79 2m-79 16q38-11 79 3m-79 16q35-8 79 5m34-40q34-12 76-5m-76 23q34-12 76-6m-76 24q34-12 76-7" fill="none" stroke="#76bdd5" strokeWidth="3" strokeLinecap="round"/>
        <path d="M92 207q55-16 106 7 57-24 111-6" fill="none" stroke="#176b8f" strokeWidth="5" strokeLinecap="round"/>
        <path d="m113 114 7-20 19-4-14 23Z" fill="#6dd4cc" opacity=".82" stroke="#199c9c" strokeWidth="2"/>
      </g>}
      {kind==="practice" && <g>
        <path d="M237 39c-44-21-93-1-108 46-12 36-1 61 17 72l-10 35h110v-28c24-10 36-37 29-69-6-27-18-46-38-56Z" fill="#c5f6fc" stroke="#1685b0" strokeWidth="3"/>
        <path d="M169 72c-25-18-43 10-34 28-12 19 2 38 21 36 8 19 32 17 39 6 18 10 35-1 32-17 22-9 17-34-3-37 0-22-26-28-36-17-7-4-13-4-19 1Z" fill="#5ee4e6" stroke="#1d9acc" strokeWidth="4"/>
        <path d="M185 69c-8 15 2 24 14 29m-43-17c11 5 15 17 11 29m-31-6c17 4 20 19 18 31m47-36c-6 15 7 25 22 21m-40-4c-7 10-5 21 5 28" fill="none" stroke="#1474a5" strokeWidth="3" strokeLinecap="round"/>
        <g fill="#f3ffff" stroke="#1688ad" strokeWidth="2"><circle cx="184" cy="69" r="6"/><circle cx="136" cy="104" r="6"/><circle cx="224" cy="118" r="6"/><circle cx="188" cy="143" r="6"/></g>
        <path d="M191 160v28m-33 0h69" stroke="#177fa4" strokeWidth="5" strokeLinecap="round"/>
      </g>}
      {kind==="professional"&& <g>
        <path d="M129 118c-21 1-35 19-39 42l-7 55h120l-7-58c-3-23-20-39-43-39Z" fill="#153d76" stroke="#1c69a0" strokeWidth="3"/>
        <path d="m114 124 22 23 20-23" fill="none" stroke="#c4efff" strokeWidth="4"/>
        <rect x="128" y="93" width="20" height="35" rx="9" fill="#e6ac8b"/>
        <ellipse cx="139" cy="74" rx="30" ry="39" fill="#f0c3a4" stroke="#b98169" strokeWidth="2"/>
        <path d="M110 80c-9-20-3-38 10-45 17-21 46-7 50 9 5 12-1 29-8 31-5-14-19-21-28-21-8 11-15 18-24 19Z" fill="#18304a"/>
        <path d="M128 91c7 7 19 8 25 0" fill="none" stroke="#99695f" strokeWidth="2" strokeLinecap="round"/>
        <path d="M237 140c-23 0-43 12-47 39l-5 36h119l-5-35c-4-26-19-40-42-40Z" fill="#77c9e6" stroke="#268bae" strokeWidth="3"/>
        <rect x="237" y="119" width="21" height="30" rx="10" fill="#e6ac8b"/>
        <ellipse cx="247" cy="99" rx="28" ry="37" fill="#efc5ab" stroke="#b98169" strokeWidth="2"/>
        <path d="M219 95c-2-19 11-39 33-39 20 0 30 18 25 39-9-12-18-11-29-18-9 8-16 10-29 11Z" fill="#1b3346"/>
        <path d="M236 113c9 5 16 5 24 0" fill="none" stroke="#99695f" strokeWidth="2" strokeLinecap="round"/>
        {kind==="professional" ? <g>
          <path d="M175 158c17 5 28-4 46-18l21-13" fill="none" stroke="#e4a88b" strokeWidth="16" strokeLinecap="round"/>
          <path d="M272 155c-14 16-23 18-41 19" fill="none" stroke="#e4a88b" strokeWidth="13" strokeLinecap="round"/>
          <path d="m267 29 9 15 16 4" stroke="#9577df" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g> : <g>
          <path d="M172 161c16 0 32-10 50-16l23-7" fill="none" stroke="#e4a88b" strokeWidth="15" strokeLinecap="round"/>
          <path d="M284 157c-12 13-23 17-39 17" fill="none" stroke="#e4a88b" strokeWidth="12" strokeLinecap="round"/>
          <circle cx="251" cy="146" r="17" fill="none" stroke="#05af9e" strokeDasharray="3 5" strokeWidth="3"/>
        </g>}
      </g>}
      {kind==="care" && <g>
        {/* Clinic scene: a male patient resting on a plinth and a male physiotherapist. */}
        <rect x="66" y="174" width="245" height="13" rx="6" fill="#e8fcff" stroke="#2c8eab" strokeWidth="3"/>
        <path d="M93 188v23m193-23v23" stroke="#3d8da4" strokeWidth="7" strokeLinecap="round"/>
        <path d="M146 147c20-13 43-13 67-5l57 16-9 22H142Z" fill="#84cfe3" stroke="#368da9" strokeWidth="3"/>
        <path d="M155 160c32-3 67 5 92 12" stroke="#d2f4ff" strokeWidth="3" fill="none"/>
        <path d="M106 160c-20-2-32-12-31-26 1-15 13-27 29-27 17 0 26 15 25 29-1 14-6 24-23 24Z" fill="#edb999" stroke="#bc826b" strokeWidth="2.5"/>
        <path d="M77 135c-5-19 13-34 27-35 18-2 30 13 28 30-15-5-27-6-41 1Z" fill="#192d42"/>
        <path d="M97 152c6 4 11 4 17 0" fill="none" stroke="#9b665d" strokeWidth="2" strokeLinecap="round"/>
        <path d="M216 122c-21 3-30 14-36 34l-12 53h137l-11-55c-5-21-18-32-40-32Z" fill="#123f79" stroke="#215d94" strokeWidth="3"/>
        <path d="m221 130 22 22 20-22" fill="none" stroke="#a4eff5" strokeWidth="4"/>
        <rect x="230" y="100" width="25" height="34" rx="9" fill="#e9b595"/>
        <ellipse cx="244" cy="83" rx="28" ry="34" fill="#f2c6a8" stroke="#bf8b71" strokeWidth="2"/>
        <path d="M217 86c-6-19 4-40 25-43 19-5 34 12 30 33-9-7-20-8-30-18-9 12-17 17-25 20Z" fill="#19304c"/>
        <path d="M231 96c8 6 17 6 25 0" fill="none" stroke="#9b665d" strokeWidth="2" strokeLinecap="round"/>
        <path d="M213 153c-17 0-30-8-42-14l-29-10" stroke="#ebba9b" strokeWidth="14" strokeLinecap="round" fill="none"/>
        <path d="M275 160c-22 5-41 0-58-7" stroke="#ebba9b" strokeWidth="12" strokeLinecap="round" fill="none"/>
        <circle cx="168" cy="142" r="17" fill="none" stroke="#13a8a1" strokeDasharray="4 5" strokeWidth="3"/>
      </g>}
      <path d="m280 37 10 5 4 10 5-10 10-5-10-4-5-10-4 10Z" fill="#ffffff" opacity=".82"/>
    </svg>
  );
}
