/**
 * FILE: 3d-toys/eight-ball-pool/frontend/components/pool-controls.jsx
 * PURPOSE: game HUD pieces: pull-down power bar, cue-ball spin pad, player cards with ball chips
 * UI: Play > HUD (power bar, spin pad, players)
 * USED BY: play-page.jsx
 * KEY EXPORTS: PowerBar, SpinPad, PlayerCards, BallChip
 */

import { useRef } from 'react'
import { SOLIDS, STRIPES } from '../../backend/pool-game-rules.js'
import { BALL_COLORS } from './pool-table-scene.js'

const clamp = ( value ) => Math.min( 1, Math.max( 0, value ) )

// Play > HUD > Power bar: drag down to pull cue back, release to shoot
export function PowerBar( { power, disabled, onPower, onShoot } ) {
  const trackRef = useRef( null )
  const dragging = useRef( false )
  const valueAt = ( event ) => {
    const rect = trackRef.current.getBoundingClientRect()
    return clamp( ( event.clientY - rect.top ) / rect.height )
  }
  return (
    <div
      ref={ trackRef }
      className="power-bar"
      role="slider"
      aria-label="Shot power: drag down, release to shoot"
      aria-valuemin={ 0 }
      aria-valuemax={ 100 }
      aria-valuenow={ Math.round( power * 100 ) }
      aria-disabled={ disabled }
      tabIndex={ disabled ? -1 : 0 }
      data-disabled={ disabled }
      onPointerDown={ ( event ) => {
        if ( disabled ) return
        dragging.current = true
        event.currentTarget.setPointerCapture( event.pointerId )
        onPower( valueAt( event ) )
      } }
      onPointerMove={ ( event ) => {
        if ( dragging.current ) onPower( valueAt( event ) )
      } }
      onPointerUp={ ( event ) => {
        if ( !dragging.current ) return
        dragging.current = false
        const value = valueAt( event )
        if ( value > 0.02 ) onShoot( value )
        else onPower( 0 )
      } }
      onPointerCancel={ () => {
        dragging.current = false
        onPower( 0 )
      } }
      onKeyDown={ ( event ) => {
        if ( disabled ) return
        if ( event.key === 'ArrowDown' ) onPower( clamp( power + 0.05 ) )
        else if ( event.key === 'ArrowUp' ) onPower( clamp( power - 0.05 ) )
        else if ( event.key === 'Enter' || event.key === ' ' ) { if ( power > 0.02 ) onShoot( power ) }
        else return
        event.preventDefault()
        event.stopPropagation()
      } }
    >
      <div className="power-fill" style={ { height: `${ power * 100 }%` } } />
      <div className="power-handle" style={ { top: `${ power * 100 }%` } } />
      <span className="power-label">{ power > 0 ? Math.round( power * 100 ) : 'Pull' }</span>
    </div>
  )
}

// Play > HUD > Spin pad: tap high for follow, low for draw, centre for stun
export function SpinPad( { spin, disabled, onSpin } ) {
  const padRef = useRef( null )
  const dragging = useRef( false )
  const valueAt = ( event ) => {
    const rect = padRef.current.getBoundingClientRect()
    const offset = ( event.clientY - ( rect.top + rect.height / 2 ) ) / ( rect.height / 2 )
    const value = Math.max( -1, Math.min( 1, -offset / 0.8 ) )
    // snap near centre: stun is most common shot
    return Math.abs( value ) < 0.12 ? 0 : Math.round( value * 20 ) / 20
  }
  return (
    <div
      ref={ padRef }
      className="spin-pad"
      role="slider"
      aria-label="Cue ball spin: up follow, down draw"
      aria-valuemin={ -100 }
      aria-valuemax={ 100 }
      aria-valuenow={ Math.round( spin * 100 ) }
      aria-valuetext={ spin > 0 ? `Follow ${ Math.round( spin * 100 ) }%` : spin < 0 ? `Draw ${ Math.round( -spin * 100 ) }%` : 'Centre ball' }
      tabIndex={ disabled ? -1 : 0 }
      data-disabled={ disabled }
      onPointerDown={ ( event ) => {
        if ( disabled ) return
        dragging.current = true
        event.currentTarget.setPointerCapture( event.pointerId )
        onSpin( valueAt( event ) )
      } }
      onPointerMove={ ( event ) => { if ( dragging.current ) onSpin( valueAt( event ) ) } }
      onPointerUp={ () => { dragging.current = false } }
      onDoubleClick={ () => onSpin( 0 ) }
      onKeyDown={ ( event ) => {
        if ( disabled ) return
        if ( event.key === 'ArrowUp' ) onSpin( Math.min( 1, spin + 0.1 ) )
        else if ( event.key === 'ArrowDown' ) onSpin( Math.max( -1, spin - 0.1 ) )
        else if ( event.key === '0' ) onSpin( 0 )
        else return
        event.preventDefault()
        event.stopPropagation()
      } }
    >
      <span className="spin-dot" style={ { transform: `translateY(${ -spin * 40 }%)` } } />
      <span className="spin-label">{ spin > 0 ? 'Follow' : spin < 0 ? 'Draw' : 'Stun' }</span>
    </div>
  )
}

// Play > HUD > players: one numbered chip, solid or striped
export function BallChip( { id, potted = false } ) {
  const color = BALL_COLORS[ id - 1 ]
  const stripe = id > 8
  return (
    <span
      className="ball-chip"
      data-potted={ potted }
      data-stripe={ stripe }
      style={ { '--chip': color } }
      aria-label={ `${ id }${ potted ? ' potted' : '' }` }
    >
      { id }
    </span>
  )
}

const GROUP_LABEL = { solids: 'Solids', stripes: 'Stripes' }

// Play > HUD > players: who is up, which group, balls left
export function PlayerCards( { game } ) {
  if ( game.mode === 'practice' ) {
    return (
      <div className="player-cards">
        <div className="player-card" data-active="true">
          <span className="player-name">Practice</span>
          <span className="player-meta">{ game.shots } shot{ game.shots === 1 ? '' : 's' } · { game.potted.length }/15 potted</span>
        </div>
      </div>
    )
  }
  const potted = new Set( game.potted )
  return (
    <div className="player-cards">
      { game.players.map( ( player, index ) => {
        const ids = player.group === 'solids' ? SOLIDS : player.group === 'stripes' ? STRIPES : []
        const cleared = ids.length > 0 && ids.every( ( id ) => potted.has( id ) )
        return (
          <div key={ player.name } className="player-card" data-active={ game.turn === index && game.phase !== 'over' }>
            <span className="player-name">{ player.name }</span>
            <span className="player-meta">{ player.group ? GROUP_LABEL[ player.group ] : 'Open table' }</span>
            <span className="player-chips">
              { ids.map( ( id ) => <BallChip key={ id } id={ id } potted={ potted.has( id ) } /> ) }
              { cleared && <BallChip id={ 8 } potted={ potted.has( 8 ) } /> }
            </span>
          </div>
        )
      } ) }
    </div>
  )
}
