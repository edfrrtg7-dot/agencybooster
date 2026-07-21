/**
 * Companion Brand Colors
 *
 * Global brand variables for the Companion visual identity.
 * All widgets must use these colors for consistency.
 */

/** Brand color definitions. */
export const BRAND_COLORS = {
    /** Primary brand color. */
    primary: "#2F6BFF",
    /** Primary hover state. */
    primaryHover: "#4A82FF",
    /** Dark background. */
    darkBg: "#1F2235",
    /** Accent text color. */
    accentText: "#59AFFF",
    /** Text on primary. */
    textOnPrimary: "#FFFFFF",
    /** Dimmed text. */
    textDim: "rgba(255,255,255,0.5)",
    /** Standard text. */
    text: "#E0E0E0",
    /** Border color. */
    border: "rgba(255,255,255,0.1)",
    /** Success color. */
    success: "#81C784",
    /** Warning color. */
    warning: "#FFB74D",
    /** Error color. */
    error: "#EF5350",
} as const;

/** CSS custom properties string for brand colors. Injected into :root. */
export const BRAND_CSS_VARS = `
:root {
    --ab-brand-primary: ${BRAND_COLORS.primary};
    --ab-brand-primary-hover: ${BRAND_COLORS.primaryHover};
    --ab-brand-dark-bg: ${BRAND_COLORS.darkBg};
    --ab-brand-accent-text: ${BRAND_COLORS.accentText};
    --ab-brand-text-on-primary: ${BRAND_COLORS.textOnPrimary};
    --ab-brand-text-dim: ${BRAND_COLORS.textDim};
    --ab-brand-text: ${BRAND_COLORS.text};
    --ab-brand-border: ${BRAND_COLORS.border};
    --ab-brand-success: ${BRAND_COLORS.success};
    --ab-brand-warning: ${BRAND_COLORS.warning};
    --ab-brand-error: ${BRAND_COLORS.error};
}
`;
