/**
 * FILE: 3d-toys/physics-portfolio-builder/backend/preset-info.js
 * PURPOSE: scene labels and project limits, no physics imports (keeps Rapier out of viewer bundle)
 * UI: Builder > Style > Scene picker
 * USED BY: scene-presets.js, site-schema.js, style-editor.js
 * KEY EXPORTS: PRESET_INFO, PRESET_IDS
 */

export const PRESET_INFO = Object.freeze( {
  pool: Object.freeze( { id: 'pool', label: 'Pool break', blurb: 'Cue ball breaks a racked triangle on felt.', maxProjects: 15 } ),
  marbles: Object.freeze( { id: 'marbles', label: 'Marble shot', blurb: 'Heavy shooter scatters a cluster of glass marbles.', maxProjects: 24 } ),
  dominoes: Object.freeze( { id: 'dominoes', label: 'Domino run', blurb: 'A rolling ball topples an S-curve of tiles.', maxProjects: 20 } ),
} )

export const PRESET_IDS = Object.freeze( Object.keys( PRESET_INFO ) )
