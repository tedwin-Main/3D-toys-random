/**
 * FILE: src/features/toy-box/physics-portfolio-builder/theme-tokens.js
 * PURPOSE: site palette + font pair to CSS custom properties on an element
 * UI: Viewer (whole page), Builder > Preview frame
 * USED BY: viewer-page.js, preview-panel.js
 * KEY EXPORTS: themeTokens, applyTheme
 */

import { FONT_PAIRS, PALETTES } from './site-schema.js'

export const themeTokens = ( site ) => {
  const palette = PALETTES[ site.palette ] || PALETTES.felt
  const fonts = FONT_PAIRS[ site.fontPair ] || FONT_PAIRS.grotesk
  return {
    '--bg': palette.bg,
    '--fg': palette.fg,
    '--muted': palette.muted,
    '--line': palette.line,
    '--surface': palette.surface,
    '--accent': palette.accent,
    '--font-display': fonts.display,
    '--font-body': fonts.body,
  }
}

export const applyTheme = ( element, site ) => {
  for ( const [ name, value ] of Object.entries( themeTokens( site ) ) ) element.style.setProperty( name, value )
}
