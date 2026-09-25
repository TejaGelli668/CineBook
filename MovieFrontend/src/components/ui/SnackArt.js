// Hand-drawn canteen illustrations, used when a menu item has no photo.
// Picked by keywords in the item's name, falling back to its category.
import React from "react";

const INK = "#2a1630";
const CREAM = "#fff6e9";

const Popcorn = () => (
  <g>
    {/* kernels */}
    {[
      [58, 44, 11], [72, 36, 12], [88, 38, 12], [102, 45, 11], [66, 52, 10],
      [80, 48, 11], [95, 53, 10], [52, 56, 8], [108, 57, 8], [80, 30, 9],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 3 ? CREAM : "#ffe08a"} stroke={INK} strokeWidth="2" />
    ))}
    {/* striped tub */}
    <path d="M46 58 H114 L104 110 H56 Z" fill={CREAM} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${52 + i * 20} 58 H${62 + i * 20} L${60 + i * 18} 110 H${56 + i * 16} Z`} fill="#d92b3a" />
    ))}
    <path d="M46 58 H114 L104 110 H56 Z" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="44" y="56" width="72" height="8" rx="3" fill="#d92b3a" stroke={INK} strokeWidth="2.5" />
  </g>
);

const Samosa = () => (
  <g>
    <ellipse cx="80" cy="104" rx="56" ry="8" fill={INK} opacity="0.25" />
    <path d="M28 100 L64 36 L100 100 Z" fill="#e5a54b" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M64 36 L70 100" stroke="#b87327" strokeWidth="2" />
    <path d="M70 102 L102 50 L134 102 Z" fill="#efb65c" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M102 50 L106 102" stroke="#b87327" strokeWidth="2" />
    {[[46, 84], [56, 72], [84, 88], [92, 80], [118, 92], [110, 76], [124, 86]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="1.8" fill="#b87327" />
    ))}
    {/* green chutney */}
    <ellipse cx="128" cy="62" rx="16" ry="9" fill="#6fbf73" stroke={INK} strokeWidth="2.5" />
    <ellipse cx="124" cy="60" rx="5" ry="2" fill={CREAM} opacity="0.6" />
  </g>
);

const Nachos = () => (
  <g>
    {[
      "M38 70 L60 30 L76 72 Z",
      "M62 72 L84 26 L102 70 Z",
      "M86 72 L112 34 L124 76 Z",
      "M50 74 L70 48 L92 76 Z",
    ].map((d, i) => (
      <path key={i} d={d} fill={i % 2 ? "#f6c945" : "#f1b93a"} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    ))}
    {/* cheese */}
    <path d="M44 72 C60 64 76 80 92 70 C104 64 116 74 124 72 L122 80 C112 84 104 96 98 84 C90 92 80 98 74 84 C64 96 54 88 50 80 Z" fill="#ff9f1c" stroke={INK} strokeWidth="2" />
    {/* bowl */}
    <path d="M30 76 H130 C128 100 108 112 80 112 C52 112 32 100 30 76 Z" fill="#d92b3a" stroke={INK} strokeWidth="2.5" />
    <path d="M40 90 H120" stroke={CREAM} strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round" />
  </g>
);

const Chai = () => (
  <g>
    {/* steam */}
    {[70, 82, 94].map((x, i) => (
      <path key={i} d={`M${x} 40 c-6 -6 6 -10 0 -16 c-6 -6 6 -10 0 -16`} fill="none" stroke={CREAM} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    ))}
    {/* saucer */}
    <ellipse cx="82" cy="108" rx="42" ry="8" fill={CREAM} stroke={INK} strokeWidth="2.5" />
    {/* Irani glass, faceted */}
    <path d="M58 46 H106 L99 104 H65 Z" fill="rgba(255,246,233,0.35)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M60 58 H104 L99 104 H65 Z" fill="#b8743c" />
    <path d="M60 58 H104 L103 64 H61 Z" fill="#e7c8a0" />
    {[70, 82, 94].map((x, i) => (
      <path key={i} d={`M${x - 2 + i} 60 L${x - 1 + i} 102`} stroke={INK} strokeOpacity="0.25" strokeWidth="2" />
    ))}
    <path d="M58 46 H106 L99 104 H65 Z" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
  </g>
);

const ColdCoffee = () => (
  <g>
    {/* straw */}
    <path d="M92 44 L110 10" stroke="#d92b3a" strokeWidth="6" strokeLinecap="round" />
    <path d="M92 44 L110 10" stroke={CREAM} strokeWidth="6" strokeDasharray="4 6" strokeLinecap="round" />
    {/* ice cream scoop */}
    <circle cx="80" cy="42" r="18" fill={CREAM} stroke={INK} strokeWidth="2.5" />
    <path d="M64 46 c6 6 10 0 16 4 c6 4 10 -2 16 -4" fill="none" stroke={INK} strokeWidth="2" />
    {/* glass */}
    <path d="M58 48 H102 L96 112 H64 Z" fill="#8a5a3b" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M60 60 H100" stroke="#c89468" strokeWidth="5" />
    {[[70, 80], [86, 92], [74, 100]].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width="10" height="10" rx="2" fill={CREAM} opacity="0.35" transform={`rotate(${i * 20} ${x + 5} ${y + 5})`} />
    ))}
  </g>
);

const Meetha = () => (
  <g>
    {/* bread pieces soaked in syrup */}
    {[[50, 52, -8], [72, 46, 6], [94, 52, -4], [62, 62, 10], [86, 64, -10]].map(([x, y, r], i) => (
      <g key={i} transform={`rotate(${r} ${x + 11} ${y + 11})`}>
        <rect x={x} y={y} width="24" height="22" rx="4" fill="#d98b3a" stroke={INK} strokeWidth="2.5" />
        <rect x={x + 3} y={y + 3} width="18" height="7" rx="2" fill="#f0b25e" />
      </g>
    ))}
    {/* nuts */}
    {[[58, 50, "#8fd8b4"], [84, 44, CREAM], [102, 56, "#8fd8b4"], [74, 62, CREAM]].map(([x, y, c], i) => (
      <ellipse key={i} cx={x} cy={y} rx="4" ry="2.5" fill={c} stroke={INK} strokeWidth="1.2" />
    ))}
    {/* bowl */}
    <path d="M30 74 H130 C128 100 108 112 80 112 C52 112 32 100 30 74 Z" fill={CREAM} stroke={INK} strokeWidth="2.5" />
    <path d="M36 86 H124" stroke="#d92b3a" strokeWidth="3" />
    <path d="M42 94 H118" stroke="#ffc94a" strokeWidth="3" />
  </g>
);

const Drink = () => (
  <g>
    <path d="M90 36 L102 8" stroke={CREAM} strokeWidth="5" strokeLinecap="round" />
    <path d="M56 36 H104 L96 112 H64 Z" fill="#d92b3a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="52" y="30" width="56" height="10" rx="4" fill={CREAM} stroke={INK} strokeWidth="2.5" />
    <circle cx="80" cy="74" r="14" fill={CREAM} stroke={INK} strokeWidth="2" />
    <path d="M73 74 h14" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
  </g>
);

const SnackBox = () => (
  <g>
    <path d="M44 50 L80 36 L116 50 L80 64 Z" fill="#ffc94a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M44 50 V96 L80 110 V64 Z" fill="#f1b93a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M116 50 V96 L80 110 V64 Z" fill="#d92b3a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M92 80 l12 -5 M92 90 l12 -5" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
  </g>
);

const ART = [
  [/popcorn|corn/, Popcorn],
  [/samosa|puff|pakoda|pakora/, Samosa],
  [/nacho|chips|crisps/, Nachos],
  [/chai|tea/, Chai],
  [/coffee|shake|frappe|latte/, ColdCoffee],
  [/meetha|dessert|ice ?cream|kulfi|sweet|pudding|brownie|gulab/, Meetha],
  [/cola|coke|pepsi|soda|juice|water|drink|lime/, Drink],
];

const BY_CATEGORY = { BEVERAGES: Drink, DESSERTS: Meetha, SNACKS: SnackBox };

export const TINT = { SNACKS: "gold", BEVERAGES: "mint", DESSERTS: "pink" };

const SnackArt = ({ name = "", category = "" }) => {
  const lower = name.toLowerCase();
  const Art =
    (ART.find(([re]) => re.test(lower)) || [])[1] ||
    BY_CATEGORY[category] ||
    SnackBox;
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label={name} className="cb-snackart">
      <Art />
    </svg>
  );
};

export default SnackArt;
