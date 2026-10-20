/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#18243a',
    tint: '#205fea',

    // Core surfaces
    background: '#ffffff',
    foreground: '#18243a',

    // Cards / elevated surfaces
    card: '#f5f8fe',
    cardForeground: '#18243a',

    // Primary action color (buttons, links, active states)
    primary: '#205fea',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#eff4ff',
    secondaryForeground: '#1e335f',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#edf2f8',
    mutedForeground: '#68758a',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#e8f0ff',
    accentForeground: '#1f4b9f',

    // Destructive actions (delete, error states)
    destructive: '#d64545',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dfe7f1',
    input: '#d8e1ef',

    // Practice status colors
    success: '#16865b',
    successSoft: '#e8f7f0',
    warning: '#d48a12',
    warningSoft: '#fff5df',
    primarySoft: '#eaf1ff',
    destructiveSoft: '#fff0f0',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
