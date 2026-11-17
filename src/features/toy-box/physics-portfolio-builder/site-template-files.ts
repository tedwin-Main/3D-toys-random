// Declares static template file manifest for exported portfolio bundles.

// viewer.html becomes index.html in the zip; rest sit flat beside it so relative imports still resolve
export const TEMPLATE_FILES = Object.freeze( [
  'viewer.html',
  'viewer-main.ts',
  'viewer-page.ts',
  'html.ts',
  'builder-icons.ts',
  'site-loader.ts',
  'draft-store.ts',
  'theme-tokens.ts',
  'break-stage.ts',
  'scene-renderer.ts',
  'camera-path.ts',
  'body-textures.ts',
  'project-drawer.ts',
  'project-grid.ts',
  'shared.css',
  'viewer.css',
  'scene-recording.ts',
  'site-schema.ts',
  'preset-info.ts',
  'seeded-random.ts',
] )
