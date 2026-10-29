/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/site-template-files.js
 * PURPOSE: every file the published viewer needs, paths relative to builder root (no build, so hand list)
 * UI: Builder > Top bar > Export zip
 * USED BY: export-site.js, site-template-files.test.js
 * KEY EXPORTS: TEMPLATE_FILES
 */

// viewer.html becomes index.html in the zip; rest keep paths so relative imports still resolve
export const TEMPLATE_FILES = Object.freeze( [
  'viewer.html',
  'frontend/viewer-main.js',
  'frontend/pages/viewer-page.js',
  'frontend/components/html.js',
  'frontend/components/builder-icons.js',
  'frontend/components/site-loader.js',
  'frontend/components/draft-store.js',
  'frontend/components/theme-tokens.js',
  'frontend/components/break-stage.js',
  'frontend/components/scene-renderer.js',
  'frontend/components/camera-path.js',
  'frontend/components/body-textures.js',
  'frontend/components/project-drawer.js',
  'frontend/components/project-grid.js',
  'frontend/components/shared.css',
  'frontend/components/viewer.css',
  'backend/scene-recording.js',
  'backend/site-schema.js',
  'backend/preset-info.js',
  'backend/seeded-random.js',
] )
