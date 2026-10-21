/**
 * FILE: 3d-toys/eight-ball-pool/frontend/components/pool-shot-client.js
 * PURPOSE: promise wrapper over pool shot worker, one shared worker per tab
 * UI: Play > shot, Play > vs Bot
 * USED BY: play-page.js
 * KEY EXPORTS: simulateShotAsync, chooseBotShot
 */

let worker = null
let nextId = 0
const pending = new Map()

const getWorker = () => {
  if ( worker ) return worker
  worker = new Worker( new URL( './pool-shot-worker.js', import.meta.url ), { type: 'module' } )
  worker.onmessage = ( { data } ) => {
    const request = pending.get( data.id )
    if ( !request ) return
    pending.delete( data.id )
    if ( data.error ) request.reject( new Error( data.error ) )
    else request.resolve( data.result ?? data.shot )
  }
  worker.onerror = ( event ) => {
    for ( const request of pending.values() ) request.reject( new Error( event.message || 'Shot worker crashed' ) )
    pending.clear()
    worker = null
  }
  return worker
}

const request = ( message ) => new Promise( ( resolve, reject ) => {
  const id = nextId++
  pending.set( id, { resolve, reject } )
  getWorker().postMessage( { ...message, id } )
} )

// Play > shoot: full shot recording + rule facts
export const simulateShotAsync = ( balls, shot ) => request( { type: 'simulate', balls, shot } )

// Play > vs Bot > bot turn: shot + cue spot when ball in hand
export const chooseBotShot = ( { balls, state, difficulty, seed } ) => request( { type: 'bot', balls, state, difficulty, seed } )
