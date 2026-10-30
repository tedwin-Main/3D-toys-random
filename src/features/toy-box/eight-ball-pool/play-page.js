// Renders 8-Ball pool play page with HUD, table view, and controls.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { html } from './html.js'
import { ArrowCounterClockwise, ArrowsClockwise, CameraRotate, FastForward, X } from './game-icons.js'
import {
  GAME_CONFIG, HEAD_STRING_Z, TABLE, createRack, findFreeSpot, isPlacementValid, placeCueBall, respotBall,
} from './pool-game-physics.js'
import { applyShot, createGame, legalTargets } from './pool-game-rules.js'
import { createPoolTableScene } from './pool-table-scene.js'
import { attachAimInput } from './pool-aim-input.js'
import { chooseBotShot, simulateShotAsync } from './pool-shot-client.js'
import { hintFor } from './play-hint.js'
import { PlayerCards, PowerBar, SpinPad } from './pool-controls.js'

const RADIUS = GAME_CONFIG.ball.radius
const FINE_POINTER = typeof window !== 'undefined' && window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches
// cue at head end, rack at foot end: aim straight up table
const START_ANGLE = -Math.PI / 2
const KITCHEN_SPOT = { x: 0, z: HEAD_STRING_Z + 0.2 }
const clamp = ( value, min, max ) => Math.min( max, Math.max( min, value ) )
const wait = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) )
const easeInOut = ( t ) => ( t < 0.5 ? 2 * t * t : 1 - ( -2 * t + 2 ) ** 2 / 2 )
const randomSeed = () => Math.floor( Math.random() * 2 ** 31 )

// Run engine: rAF tween, t 0..1
const tween = ( duration, onUpdate ) => new Promise( ( resolve ) => {
  const start = performance.now()
  const step = ( now ) => {
    const t = Math.min( 1, ( now - start ) / duration )
    onUpdate( t )
    if ( t < 1 ) requestAnimationFrame( step )
    else resolve()
  }
  requestAnimationFrame( step )
} )

const MODES = [
  { mode: 'practice', difficulty: 'easy', label: 'Practice', note: 'Solo. Clear the table.' },
  { mode: 'bot', difficulty: 'easy', label: 'vs Bot · Easy', note: 'Misses now and then.' },
  { mode: 'bot', difficulty: 'pro', label: 'vs Bot · Pro', note: 'Plans position. Rarely misses.' },
]

// Play > turn flow + HUD actions; live ref holds truth, React setters mirror for HUD
function createPlayActions( { live, sceneRef, ui } ) {
  const setPhaseBoth = ( next ) => {
    live.current.phase = next
    ui.setPhase( next )
  }
  const setPower = ( value ) => {
    live.current.power = value
    ui.setPower( value )
    sceneRef.current?.setAim( { power: value } )
  }
  const setSpin = ( value ) => {
    live.current.spin = value
    ui.setSpin( value )
  }
  const setAngle = ( value ) => {
    live.current.angle = value
    sceneRef.current?.setAim( { angle: value } )
  }
  const showToast = ( text ) => ui.setToast( { text, key: performance.now() } )
  const commitBalls = ( balls ) => {
    live.current.balls = balls
    sceneRef.current?.setBalls( balls )
  }
  const commitGame = ( state ) => {
    live.current.game = state
    ui.setGame( state )
  }

  // Play > turn start: human aims, bot thinks, finished game shows result
  const beginTurn = ( state ) => {
    const scene = sceneRef.current
    if ( state.phase === 'over' ) {
      scene.setAim( { visible: false, stickOnly: false } )
      scene.setPlacement( { active: false } )
      setPhaseBoth( 'over' )
      return
    }
    if ( state.players[ state.turn ].kind === 'bot' ) {
      scene.setAim( { visible: false, stickOnly: true, power: 0, legal: [], halo: [] } )
      scene.setPlacement( { active: false } )
      setPhaseBoth( 'bot' )
      runBot( state )
      return
    }
    const cue = live.current.balls[ 0 ]
    live.current.lastValid = { x: cue.x, z: cue.z }
    live.current.placeValid = true
    const legal = legalTargets( state )
    const grouped = state.mode === 'bot' && state.players[ state.turn ].group
    scene.setAim( { visible: true, stickOnly: false, power: 0, legal, halo: grouped ? legal : [] } )
    scene.setPlacement( { active: Boolean( state.ballInHand ), valid: true } )
    setPhaseBoth( 'aim' )
  }

  // Play > shot end: rules verdict, respot 8, cue back on table after scratch
  const finishShot = ( result ) => {
    const { state: next, events } = applyShot( live.current.game, result )
    let balls = result.balls
    if ( events.some( ( event ) => event.type === 'respot' ) ) balls = respotBall( balls, 8 )
    if ( balls[ 0 ].pocketed && next.phase !== 'over' ) balls = placeCueBall( balls, findFreeSpot( balls, KITCHEN_SPOT ) )
    commitBalls( balls )
    commitGame( next )
    setPower( 0 )
    showToast( next.message )
    beginTurn( next )
  }

  // Play > shoot: cue strokes through, worker sims, table plays frames back
  const strike = async ( shot, run ) => {
    const scene = sceneRef.current
    const before = live.current.balls
    setPhaseBoth( 'shooting' )
    scene.setPlacement( { active: false } )
    const pending = simulateShotAsync( before, shot )
    live.current.angle = shot.angle
    scene.setAim( { visible: false, stickOnly: true, angle: shot.angle, power: shot.power } )
    await tween( 90, ( t ) => scene.setAim( { power: shot.power * ( 1 - t ) } ) )
    let result
    try {
      result = await pending
    } catch ( error ) {
      console.error( error )
      if ( run !== live.current.run ) return
      showToast( 'Shot could not run. Try again.' )
      beginTurn( live.current.game )
      return
    }
    if ( run !== live.current.run ) return
    scene.setAim( { stickOnly: false } )
    live.current.lastShot = { before, result }
    ui.setCanReplay( true )
    await scene.playShot( result )
    if ( run !== live.current.run ) return
    finishShot( result )
  }

  const shoot = ( value ) => {
    const current = live.current
    if ( current.phase !== 'aim' ) return
    if ( current.game.ballInHand && !current.placeValid ) {
      showToast( 'Move the cue ball to a clear spot' )
      setPower( 0 )
      return
    }
    strike( { angle: current.angle, power: value, spin: current.spin }, current.run )
  }

  // Play > vs Bot > bot turn: think in worker, swing cue round, pull back, shoot
  const runBot = async ( state ) => {
    const run = live.current.run
    const scene = sceneRef.current
    await wait( 600 )
    if ( run !== live.current.run ) return
    let shot
    try {
      shot = await chooseBotShot( { balls: live.current.balls, state, difficulty: state.difficulty, seed: randomSeed() } )
    } catch ( error ) {
      console.error( error )
      showToast( 'Bot lost its cue. Your turn.' )
      commitGame( { ...state, turn: 0, ballInHand: 'anywhere' } )
      beginTurn( live.current.game )
      return
    }
    if ( run !== live.current.run ) return
    if ( shot.cuePosition ) {
      commitBalls( placeCueBall( live.current.balls, shot.cuePosition ) )
      await wait( 300 )
    }
    const from = live.current.angle
    const delta = Math.atan2( Math.sin( shot.angle - from ), Math.cos( shot.angle - from ) )
    await tween( Math.min( 900, 280 + Math.abs( delta ) * 380 ), ( t ) => {
      live.current.angle = from + delta * easeInOut( t )
      scene.setAim( { angle: live.current.angle } )
    } )
    if ( run !== live.current.run ) return
    await tween( 420, ( t ) => scene.setAim( { power: shot.power * easeInOut( t ) } ) )
    await wait( 140 )
    if ( run !== live.current.run ) return
    strike( { angle: shot.angle, power: shot.power, spin: shot.spin }, run )
  }

  // Play > ball in hand: cue follows pointer, red ring where it cannot go
  const placeCue = ( point ) => {
    const current = live.current
    const kitchen = current.game?.ballInHand === 'kitchen'
    const limitX = TABLE.halfWidth - RADIUS
    const limitZ = TABLE.halfLength - RADIUS
    const spot = { x: clamp( point.x, -limitX, limitX ), z: clamp( point.z, kitchen ? HEAD_STRING_Z : -limitZ, limitZ ) }
    const valid = isPlacementValid( spot, current.balls, { kitchenOnly: kitchen } )
    current.placeValid = valid
    if ( valid ) current.lastValid = spot
    commitBalls( placeCueBall( current.balls, spot ) )
    sceneRef.current.setPlacement( { valid } )
  }

  const endPlace = () => {
    const current = live.current
    if ( current.placeValid || !current.lastValid ) return
    commitBalls( placeCueBall( current.balls, current.lastValid ) )
    current.placeValid = true
    sceneRef.current.setPlacement( { valid: true } )
  }

  const toggleCamera = () => {
    const next = live.current.cameraMode === 'overhead' ? 'cue' : 'overhead'
    live.current.cameraMode = next
    ui.setCameraMode( next )
    sceneRef.current?.setCameraMode( next )
  }

  // Play > menu > mode button: fresh seeded rack, player breaks from kitchen
  const startGame = ( mode, difficulty ) => {
    live.current.run += 1
    const state = createGame( { mode, difficulty } )
    live.current.lastShot = null
    ui.setCanReplay( false )
    setAngle( START_ANGLE )
    setPower( 0 )
    setSpin( 0 )
    commitBalls( createRack( randomSeed() ) )
    commitGame( state )
    showToast( state.message )
    beginTurn( state )
  }

  const toMenu = () => {
    live.current.run += 1
    sceneRef.current?.skipShot()
    commitGame( null )
    commitBalls( createRack( 1 ) )
    setAngle( START_ANGLE )
    setPower( 0 )
    sceneRef.current?.setAim( { visible: false, stickOnly: false } )
    sceneRef.current?.setPlacement( { active: false } )
    setPhaseBoth( 'menu' )
  }

  // Play > HUD > Replay: rerun last shot from its start, then back to current table
  const replay = async () => {
    const current = live.current
    if ( !current.lastShot || ( current.phase !== 'aim' && current.phase !== 'over' ) ) return
    const resume = current.phase
    const run = current.run
    const scene = sceneRef.current
    setPhaseBoth( 'replay' )
    scene.setAim( { visible: false, stickOnly: false } )
    scene.setPlacement( { active: false } )
    scene.setBalls( current.lastShot.before )
    await scene.playShot( current.lastShot.result )
    if ( run !== live.current.run ) return
    scene.setBalls( live.current.balls )
    if ( resume === 'over' ) setPhaseBoth( 'over' )
    else beginTurn( live.current.game )
  }

  const skip = () => sceneRef.current?.skipShot()

  return { setPower, setSpin, setAngle, commitBalls, shoot, placeCue, endPlace, toggleCamera, startGame, toMenu, replay, skip }
}

// Play > table: build scene once, wire pointer aim; first-render actions stay valid (refs + setters only)
function usePoolScene( { canvasRef, sceneRef, live, actions, onFail } ) {
  useEffect( () => {
    let scene
    try {
      scene = createPoolTableScene( { canvas: canvasRef.current } )
    } catch ( error ) {
      console.warn( 'WebGL unavailable:', error )
      onFail()
      return undefined
    }
    sceneRef.current = scene
    actions.commitBalls( createRack( 1 ) )
    scene.setAim( { angle: START_ANGLE, visible: false } )
    const detach = attachAimInput( {
      canvas: canvasRef.current,
      scene,
      ctx: () => ( {
        canAct: live.current.phase === 'aim',
        cue: live.current.balls?.[ 0 ],
        angle: live.current.angle,
        power: live.current.power,
        cameraMode: live.current.cameraMode,
        ballInHand: Boolean( live.current.game?.ballInHand ),
      } ),
      onAim: actions.setAngle,
      onPower: actions.setPower,
      onShoot: actions.shoot,
      onPlace: actions.placeCue,
      onPlaceEnd: actions.endPlace,
      onToggleCamera: actions.toggleCamera,
    } )
    return () => {
      live.current.run += 1
      detach()
      scene.dispose()
      sceneRef.current = null
    }
  }, [] )
}

// Play > toast: clear after 2.8s
function useToastTimeout( toast, setToast ) {
  useEffect( () => {
    if ( !toast ) return undefined
    const timer = setTimeout( () => setToast( null ), 2800 )
    return () => clearTimeout( timer )
  }, [ toast ] )
}

// Play > HUD layout: tell table which screen edges HUD covers, so whole table stays visible
function useHudInsets( { sceneRef, topRef, controlsRef, inGame, mode } ) {
  useLayoutEffect( () => {
    const measure = () => {
      const scene = sceneRef.current
      if ( !scene ) return
      if ( !inGame ) {
        scene.setInsets( { top: 0, right: 0, bottom: 0, left: 0 } )
        return
      }
      const top = topRef.current?.getBoundingClientRect().bottom ?? 0
      const controls = controlsRef.current?.getBoundingClientRect()
      // controls may overlap outer rail a little; felt stays clear
      const right = controls ? Math.max( 0, window.innerWidth - controls.left - 18 ) : 0
      const wide = window.innerWidth >= 700
      scene.setInsets( { top: top + 4, right, bottom: 46, left: wide ? right : 6 } )
    }
    measure()
    window.addEventListener( 'resize', measure )
    return () => window.removeEventListener( 'resize', measure )
  }, [ inGame, mode ] )
}

// Play > menu: pick mode
function PlayMenu( { onStart } ) {
  return html`
    <div className="play-menu">
      <div className="play-panel">
        <p className="play-kicker">Back room</p>
        <h1>8-Ball</h1>
        <p className="play-lede">Real table physics. Break, run the rack, sink the 8.</p>
        <div className="play-modes">
          ${ MODES.map( ( item ) => html`
            <button key=${ item.label } type="button" className="play-mode" onClick=${ () => onStart( item.mode, item.difficulty ) }>
              <span>${ item.label }</span>
              <small>${ item.note }</small>
            </button>
          ` ) }
        </div>
        <p className="play-keys">${ FINE_POINTER ? 'Mouse aims · press and pull back to shoot · C swaps camera' : 'Tap to aim · drag to fine-tune · pull the power bar' }</p>
      </div>
    </div>
  `
}

// Play > HUD top bar: back, players, camera / replay / new rack
function PlayTopBar( { topRef, game, cameraMode, replayDisabled, onMenu, onToggleCamera, onReplay, onRack } ) {
  return html`
    <header ref=${ topRef } className="play-top">
      <button type="button" className="play-icon" onClick=${ onMenu } aria-label="Back to menu"><${ X } size=${ 18 } /></button>
      <${ PlayerCards } game=${ game } />
      <div className="play-tools">
        <button type="button" className="play-icon" onClick=${ onToggleCamera } aria-label=${ cameraMode === 'overhead' ? 'Cue camera' : 'Overhead camera' } aria-pressed=${ cameraMode === 'cue' }>
          <${ CameraRotate } size=${ 18 } />
        </button>
        <button type="button" className="play-icon" onClick=${ onReplay } disabled=${ replayDisabled } aria-label="Replay last shot">
          <${ ArrowCounterClockwise } size=${ 18 } />
        </button>
        <button type="button" className="play-icon" onClick=${ onRack } aria-label="New rack">
          <${ ArrowsClockwise } size=${ 18 } />
        </button>
      </div>
    </header>
  `
}

// Play > game over: result + rematch
function GameOverPanel( { game, canReplay, onRack, onReplay, onMenu } ) {
  return html`
    <div className="play-menu">
      <div className="play-panel">
        <p className="play-kicker">${ game.mode === 'practice' ? 'Table cleared' : 'Game over' }</p>
        <h1>${ game.message }</h1>
        <div className="play-modes">
          <button type="button" className="play-mode" onClick=${ onRack }><span>Rack again</span></button>
          <button type="button" className="play-mode" onClick=${ onReplay } disabled=${ !canReplay }><span>Replay last shot</span></button>
          <button type="button" className="play-mode" onClick=${ onMenu }><span>Menu</span></button>
        </div>
      </div>
    </div>
  `
}

// Play > whole page
export function PlayPage() {
  const canvasRef = useRef( null )
  const sceneRef = useRef( null )
  const topRef = useRef( null )
  const controlsRef = useRef( null )
  const [ failed, setFailed ] = useState( false )
  const [ game, setGame ] = useState( null )
  const [ phase, setPhase ] = useState( 'menu' )
  const [ power, setPowerState ] = useState( 0 )
  const [ spin, setSpinState ] = useState( 0 )
  const [ cameraMode, setCameraModeState ] = useState( 'overhead' )
  const [ toast, setToast ] = useState( null )
  const [ canReplay, setCanReplay ] = useState( false )
  // live values read by pointer handlers and async turn flow; React state only mirrors them for HUD
  const live = useRef( {
    balls: null, game: null, phase: 'menu', angle: START_ANGLE, power: 0, spin: 0,
    cameraMode: 'overhead', placeValid: true, lastValid: null, lastShot: null, run: 0,
  } )
  const actions = createPlayActions( {
    live,
    sceneRef,
    ui: { setPhase, setPower: setPowerState, setSpin: setSpinState, setCameraMode: setCameraModeState, setToast, setCanReplay, setGame },
  } )
  const { startGame, toMenu, replay, skip, toggleCamera, shoot, setPower, setSpin } = actions

  usePoolScene( { canvasRef, sceneRef, live, actions, onFail: () => setFailed( true ) } )
  useToastTimeout( toast, setToast )
  const inGame = Boolean( game ) && phase !== 'menu'
  useHudInsets( { sceneRef, topRef, controlsRef, inGame, mode: game?.mode } )

  const playing = phase === 'shooting' || phase === 'replay'
  const canAct = phase === 'aim'
  const hint = hintFor( { phase, ballInHand: game?.ballInHand, finePointer: FINE_POINTER, cameraMode } )
  const rackAgain = () => startGame( game.mode, game.difficulty )

  return html`
    <main className="play" data-phase=${ phase }>
      <div className="play-stage" onPointerDown=${ () => { if ( playing ) skip() } }>
        <canvas ref=${ canvasRef } className="play-canvas" aria-label="Pool table" />
      </div>

      ${ failed && html`
        <div className="play-panel play-fallback">
          <h1>Table unavailable</h1>
          <p>This device could not start WebGL, which the table needs.</p>
        </div>
      ` }

      ${ phase === 'menu' && !failed && html`<${ PlayMenu } onStart=${ startGame } />` }

      ${ game && phase !== 'menu' && html`
        <${ PlayTopBar }
          topRef=${ topRef }
          game=${ game }
          cameraMode=${ cameraMode }
          replayDisabled=${ !canReplay || !( phase === 'aim' || phase === 'over' ) }
          onMenu=${ toMenu }
          onToggleCamera=${ toggleCamera }
          onReplay=${ replay }
          onRack=${ rackAgain }
        />

        <div className="play-toast" aria-live="polite">
          ${ toast && html`<span key=${ toast.key }>${ toast.text }</span>` }
        </div>

        <aside ref=${ controlsRef } className="play-controls" data-hidden=${ !canAct }>
          <${ SpinPad } spin=${ spin } disabled=${ !canAct } onSpin=${ setSpin } />
          <${ PowerBar } power=${ power } disabled=${ !canAct } onPower=${ setPower } onShoot=${ shoot } />
        </aside>

        ${ playing && html`
          <button type="button" className="play-skip" onClick=${ skip }>
            <${ FastForward } size=${ 16 } /> Skip
          </button>
        ` }
        ${ hint && html`<p className="play-hint">${ hint }</p>` }

        ${ phase === 'over' && html`<${ GameOverPanel } game=${ game } canReplay=${ canReplay } onRack=${ rackAgain } onReplay=${ replay } onMenu=${ toMenu } />` }
      ` }
    </main>
  `
}
