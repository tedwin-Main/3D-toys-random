/**
 * FILE: src/features/toy-box/physics-portfolio-builder/bake-worker.js
 * PURPOSE: off-main-thread physics bake: preset + project count + seeds in, encoded recordings out
 * UI: Builder > Preview (Baking… status)
 * USED BY: bake-client.js
 * KEY EXPORTS: none (worker message protocol)
 */

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
