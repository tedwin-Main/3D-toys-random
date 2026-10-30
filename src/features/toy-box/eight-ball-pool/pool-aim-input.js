// Handles drag and touch aim input, cue elevation, and fine adjustment.

import { GAME_CONFIG } from './pool-game-physics.js'

const RADIUS = GAME_CONFIG.ball.radius
// metres of pull-back for full power
const FULL_PULL = 0.42
const TAP_SLOP = 6
const wrap = ( angle ) => Math.atan2( Math.sin( angle ), Math.cos( angle ) )

// Play > table: wire controls; ctx() says what player may do right now
export function attachAimInput( { canvas, scene, ctx, onAim, onPower, onShoot, onPlace, onPlaceEnd, onToggleCamera } ) {
  let gesture = null

  const angleTo = ( point, cue ) => Math.atan2( point.z - cue.z, point.x - cue.x )

  const handleMove = ( event ) => {
    const context = ctx()
    if ( !context.canAct ) return
    const point = scene.pickTable( event.clientX, event.clientY )
    if ( !gesture ) {
      // Play > table > hover: mouse aims straight at pointer (overhead view only)
      if ( event.pointerType === 'mouse' && context.cameraMode === 'overhead' && point
        && Math.hypot( point.x - context.cue.x, point.z - context.cue.z ) > RADIUS ) onAim( angleTo( point, context.cue ) )
      return
    }
    gesture.travel = Math.max( gesture.travel, Math.hypot( event.clientX - gesture.startX, event.clientY - gesture.startY ) )
    if ( gesture.kind === 'place' ) {
      if ( point ) onPlace( point )
      return
    }
    if ( gesture.kind === 'pull' ) {
      if ( !point ) return
      // pull counts only along aim line, backwards from shot
      const pull = -( ( point.x - gesture.start.x ) * Math.cos( context.angle ) + ( point.z - gesture.start.z ) * Math.sin( context.angle ) )
      gesture.power = Math.max( 0, Math.min( 1, pull / FULL_PULL ) )
      onPower( gesture.power )
      return
    }
    if ( gesture.kind === 'rotate' ) {
      if ( context.cameraMode === 'cue' || !point || !gesture.last ) {
        // cue cam: sideways drag turns aim; screen-space so no feedback loop with moving camera
        onAim( wrap( context.angle + ( event.clientX - gesture.lastX ) * 0.0035 ) )
      } else {
        // overhead: drag round cue ball, geared down for fine aim
        const before = angleTo( gesture.last, context.cue )
        const after = angleTo( point, context.cue )
        onAim( wrap( context.angle + wrap( after - before ) * 0.35 ) )
      }
      gesture.last = point
      gesture.lastX = event.clientX
    }
  }

  const handleDown = ( event ) => {
    const context = ctx()
    if ( !context.canAct || event.button > 0 ) return
    const point = scene.pickTable( event.clientX, event.clientY )
    const base = { startX: event.clientX, startY: event.clientY, lastX: event.clientX, travel: 0, last: point }
    if ( context.ballInHand && point && Math.hypot( point.x - context.cue.x, point.z - context.cue.z ) < RADIUS * 2.6 ) {
      gesture = { ...base, kind: 'place' }
      onPlace( point )
    } else if ( event.pointerType === 'mouse' && context.cameraMode === 'overhead' && point ) {
      gesture = { ...base, kind: 'pull', start: point, power: 0 }
    } else {
      gesture = { ...base, kind: 'rotate' }
    }
    canvas.setPointerCapture?.( event.pointerId )
    event.preventDefault()
  }

  const handleUp = ( event ) => {
    if ( !gesture ) return
    const context = ctx()
    const done = gesture
    gesture = null
    canvas.releasePointerCapture?.( event.pointerId )
    if ( !context.canAct ) return
    if ( done.kind === 'place' ) {
      onPlaceEnd()
      return
    }
    if ( done.kind === 'pull' ) {
      if ( done.power > 0.02 ) onShoot( done.power )
      else onPower( 0 )
      return
    }
    // Play > table > tap: aim straight at tapped spot
    if ( done.travel < TAP_SLOP && context.cameraMode === 'overhead' ) {
      const point = scene.pickTable( event.clientX, event.clientY )
      if ( point && Math.hypot( point.x - context.cue.x, point.z - context.cue.z ) > RADIUS ) onAim( angleTo( point, context.cue ) )
    }
  }

  const handleCancel = () => {
    if ( gesture?.kind === 'pull' ) onPower( 0 )
    if ( gesture?.kind === 'place' ) onPlaceEnd()
    gesture = null
  }

  // Play > keys: arrows aim (shift coarse), up/down power, space shoots, c camera
  const handleKey = ( event ) => {
    const context = ctx()
    if ( event.target instanceof HTMLElement && event.target.closest( 'input, textarea, select, [role="slider"]' ) ) return
    if ( event.key === 'c' || event.key === 'C' ) {
      onToggleCamera()
      return
    }
    if ( !context.canAct ) return
    const step = event.shiftKey ? 0.02 : 0.0025
    if ( event.key === 'ArrowLeft' ) onAim( wrap( context.angle - step ) )
    else if ( event.key === 'ArrowRight' ) onAim( wrap( context.angle + step ) )
    else if ( event.key === 'ArrowUp' ) onPower( Math.min( 1, context.power + 0.05 ) )
    else if ( event.key === 'ArrowDown' ) onPower( Math.max( 0, context.power - 0.05 ) )
    else if ( event.key === ' ' || event.key === 'Enter' ) {
      // focused buttons keep own space/enter
      if ( event.target instanceof HTMLElement && event.target.closest( 'button' ) ) return
      if ( context.power > 0.02 ) onShoot( context.power )
    } else return
    event.preventDefault()
  }

  canvas.addEventListener( 'pointermove', handleMove )
  canvas.addEventListener( 'pointerdown', handleDown )
  canvas.addEventListener( 'pointerup', handleUp )
  canvas.addEventListener( 'pointercancel', handleCancel )
  window.addEventListener( 'keydown', handleKey )
  return () => {
    canvas.removeEventListener( 'pointermove', handleMove )
    canvas.removeEventListener( 'pointerdown', handleDown )
    canvas.removeEventListener( 'pointerup', handleUp )
    canvas.removeEventListener( 'pointercancel', handleCancel )
    window.removeEventListener( 'keydown', handleKey )
  }
}
