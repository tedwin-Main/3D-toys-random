/**
 * FILE: src/features/toy-box/physics-portfolio-builder/site-template-files.js
 * PURPOSE: every file the published viewer needs, paths relative to builder root (no build, so hand list)
 * UI: Builder > Top bar > Export zip
 * USED BY: export-site.js, site-template-files.test.js
 * KEY EXPORTS: TEMPLATE_FILES
 */

// viewer.html becomes index.html in the zip; rest sit flat beside it so relative imports still resolve
export const TEMPLATE_FILES = Object.freeze( [
  'viewer.html',
  'viewer-main.js',
  'viewer-page.js',
  'html.js',
  'builder-icons.js',
  'site-loader.js',
  'draft-store.js',
  'theme-tokens.js',
  'break-stage.js',
  'scene-renderer.js',
  'camera-path.js',
  'body-textures.js',
  'project-drawer.js',
  'project-grid.js',
  'shared.css',
  'viewer.css',
  'scene-recording.js',
  'site-schema.js',
  'preset-info.js',
  'seeded-random.js',
] )
