const fs = require('fs');
const theme = {
  "colors": {
          "surface-tint": "#4ae176",
          "on-primary-fixed-variant": "#005321",
          "on-secondary-fixed-variant": "#39485a",
          "on-secondary-fixed": "#0d1c2d",
          "primary-fixed": "#6bff8f",
          "surface-dim": "#061327",
          "inverse-primary": "#006e2f",
          "surface-variant": "#29354a",
          "tertiary-fixed": "#dae2fd",
          "inverse-on-surface": "#253146",
          "error-container": "#93000a",
          "on-background": "#d6e3ff",
          "on-primary": "#003915",
          "on-error-container": "#ffdad6",
          "secondary": "#b9c8de",
          "tertiary-fixed-dim": "#bec6e0",
          "on-error": "#690005",
          "surface-container-highest": "#29354a",
          "surface-container-lowest": "#020e22",
          "on-tertiary-fixed-variant": "#3f465c",
          "on-primary-container": "#004b1e",
          "on-tertiary": "#283044",
          "outline-variant": "#3d4a3d",
          "primary": "#4be277",
          "outline": "#869585",
          "surface-bright": "#2d394f",
          "tertiary-container": "#a4abc4",
          "error": "#ffb4ab",
          "background": "#061327",
          "surface-container-high": "#1e2a3f",
          "surface": "#061327",
          "on-primary-fixed": "#002109",
          "on-secondary-container": "#a7b6cc",
          "primary-container": "#22c55e",
          "surface-container-low": "#0f1c30",
          "on-surface-variant": "#bccbb9",
          "secondary-fixed-dim": "#b9c8de",
          "on-surface": "#d6e3ff",
          "inverse-surface": "#d6e3ff",
          "primary-fixed-dim": "#4ae176",
          "surface-container": "#132034",
          "on-tertiary-container": "#383f54",
          "tertiary": "#bfc6e0",
          "on-secondary": "#233143",
          "secondary-fixed": "#d4e4fa",
          "on-tertiary-fixed": "#131b2e",
          "secondary-container": "#39485a"
  },
  "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
  },
  "spacing": {
          "sm": "12px",
          "xs": "8px",
          "gutter": "20px",
          "md": "16px",
          "base": "4px",
          "lg": "24px",
          "margin-mobile": "16px",
          "margin-desktop": "40px",
          "xl": "32px"
  },
  "fontFamily": {
          "headline-lg": ["Plus Jakarta Sans"],
          "headline-xl": ["Plus Jakarta Sans"],
          "label-md": ["Plus Jakarta Sans"],
          "body-md": ["Plus Jakarta Sans"],
          "body-lg": ["Plus Jakarta Sans"],
          "label-sm": ["Plus Jakarta Sans"],
          "headline-md": ["Plus Jakarta Sans"],
          "headline-lg-mobile": ["Plus Jakarta Sans"]
  },
  "fontSize": {
          "headline-lg": ["28px", {"lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
          "headline-xl": ["36px", {"lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
          "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
          "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
          "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
          "label-sm": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
          "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
          "headline-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}]
  }
};

let css = `@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");\n\n@theme {\n`;
for (const [k, v] of Object.entries(theme.colors)) css += `  --color-${k}: ${v};\n`;
for (const [k, v] of Object.entries(theme.fontFamily)) css += `  --font-${k}: ${v[0]}, sans-serif;\n`;
for (const [k, v] of Object.entries(theme.spacing)) css += `  --spacing-${k}: ${v};\n`;
for (const [k, v] of Object.entries(theme.borderRadius)) css += `  --radius-${k}: ${v};\n`;
for (const [k, v] of Object.entries(theme.fontSize)) {
  css += `  --text-${k}: ${v[0]};\n`;
  css += `  --text-${k}--line-height: ${v[1].lineHeight};\n`;
  css += `  --text-${k}--font-weight: ${v[1].fontWeight};\n`;
  if (v[1].letterSpacing) css += `  --text-${k}--letter-spacing: ${v[1].letterSpacing};\n`;
}
css += `}\n\n`;
css += `
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.glass-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.pitch-green-glow {
    box-shadow: 0 0 20px rgba(75, 226, 119, 0.15);
}
/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #061327; }
::-webkit-scrollbar-thumb { background: #29354a; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #4be277; }
`;

fs.writeFileSync('app/admin/admin.css', css);
