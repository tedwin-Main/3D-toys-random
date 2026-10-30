// Bakes physics simulation recording in background worker thread.

import { bakePreset } from './scene-presets.js'
import { encodeRecording } from './scene-recording.js'

// Run engine: bake each seed in turn, reply once with all variants
self.onmessage = async ( { data } ) => {
  const { id, preset, projectCount, seeds } = data
  try {
    const encoded = []
    for ( const seed of seeds ) encoded.push( encodeRecording( await bakePreset( preset, { projectCount, seed } ) ) )
    self.postMessage( { id, encoded } )
  } catch ( error ) {
    self.postMessage( { id, error: error.message } )
  }
}
