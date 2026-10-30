// Defines scene presets, project limits, and metadata without physics dependencies.

export const PRESET_INFO = Object.freeze( {
  pool: Object.freeze( { id: 'pool', label: 'Pool break', blurb: 'Cue ball breaks a racked triangle on felt.', maxProjects: 15 } ),
  marbles: Object.freeze( { id: 'marbles', label: 'Marble shot', blurb: 'Heavy shooter scatters a cluster of glass marbles.', maxProjects: 24 } ),
  dominoes: Object.freeze( { id: 'dominoes', label: 'Domino run', blurb: 'A rolling ball topples an S-curve of tiles.', maxProjects: 20 } ),
} )

export const PRESET_IDS = Object.freeze( Object.keys( PRESET_INFO ) )
