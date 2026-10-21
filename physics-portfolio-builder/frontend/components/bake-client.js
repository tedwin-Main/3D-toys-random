/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/bake-client.js
 * PURPOSE: promise wrapper over bake worker, one shared worker per tab
 * UI: Builder > Preview
 * USED BY: builder-page.js
 * KEY EXPORTS: bakeVariants, VARIANT_COUNT
 */

export const VARIANT_COUNT = 3

let worker = null
let nextId = 0
const pending = new Map()

const getWorker = () => {
  if ( worker ) return worker
  worker = new Worker( new URL( './bake-worker.js', import.meta.url ), { type: 'module' } )
  worker.onmessage = ( { data } ) => {
    const request = pending.get( data.id )
    if ( !request ) return
    pending.delete( data.id )
    if ( data.error ) request.reject( new Error( data.error ) )
    else request.resolve( data.encoded )
  }
  worker.onerror = ( event ) => {
    for ( const request of pending.values() ) request.reject( new Error( event.message || 'Bake worker crashed' ) )
    pending.clear()
    worker = null
  }
  return worker
}

// Builder > Preview: bake N seeded variants of current scene, resolves encoded recordings
export function bakeVariants( { preset, projectCount, seed } ) {
  const id = nextId++
  const seeds = Array.from( { length: VARIANT_COUNT }, ( _, index ) => seed + index * 7919 )
  return new Promise( ( resolve, reject ) => {
    pending.set( id, { resolve, reject } )
    getWorker().postMessage( { id, preset, projectCount, seeds } )
  } )
}
