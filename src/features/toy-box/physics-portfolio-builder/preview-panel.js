/**
 * FILE: src/features/toy-box/physics-portfolio-builder/preview-panel.js
 * PURPOSE: live scene preview: scrub slider, play, variant pills, reroll, label toggle, bake status
 * UI: Builder > Preview
 * USED BY: builder-page.js
 * KEY EXPORTS: PreviewPanel
 */

import { useEffect, useRef, useState } from 'react'
import { html } from './html.js'
import { ArrowsClockwise, Pause, Play, Tag } from './builder-icons.js'
import { PRESET_INFO } from './preset-info.js'
import { BreakStage } from './break-stage.js'
import { themeTokens } from './theme-tokens.js'

const PLAY_SECONDS = 7

export function PreviewPanel( { site, recording, variantCount, variant, onVariant, onReroll, baking, bakeError, onSelect } ) {
  const stageRef = useRef( null )
  const [ progress, setProgress ] = useState( 0 )
  const [ playing, setPlaying ] = useState( true )
  const [ showLabels, setShowLabels ] = useState( false )
  const progressRef = useRef( 0 )

  useEffect( () => {
    progressRef.current = progress
    stageRef.current?.setProgress( progress )
  }, [ progress ] )

  // Builder > Preview: new break replays from top
  useEffect( () => {
    if ( !recording ) return
    setProgress( 0 )
    setPlaying( true )
  }, [ recording ] )

  // Builder > Preview > Play: run timeline over PLAY_SECONDS, stop at settled end
  useEffect( () => {
    if ( !playing ) return undefined
    let frame = 0
    let last = performance.now()
    const tick = ( now ) => {
      const next = Math.min( 1, progressRef.current + ( now - last ) / 1000 / PLAY_SECONDS )
      last = now
      setProgress( next )
      if ( next >= 1 ) {
        setPlaying( false )
        return
      }
      frame = requestAnimationFrame( tick )
    }
    if ( progressRef.current >= 1 ) progressRef.current = 0
    frame = requestAnimationFrame( tick )
    return () => cancelAnimationFrame( frame )
  }, [ playing ] )

  const status = bakeError ? `Bake failed: ${ bakeError }` : baking ? 'Baking physics…' : `Settles in ${ recording?.settleTime.toFixed( 1 ) ?? '–' } s`

  // Builder > Preview > Variant pill: published site picks one of these at random per visit
  const pills = Array.from( { length: variantCount }, ( _, index ) => html`
    <button key=${ index } type="button" role="radio" aria-checked=${ variant === index } onClick=${ () => onVariant( index ) }>${ index + 1 }</button>` )

  return html`
    <div className="preview-frame" style=${ themeTokens( site ) }>
      ${ recording && html`<${ BreakStage } ref=${ stageRef } recording=${ recording } site=${ site } showAllLabels=${ showLabels } onSelect=${ onSelect } />` }

      <div className="preview-top">
        <span className="preview-chip">${ PRESET_INFO[ site.preset ].label }</span>
        <span className="preview-chip" data-state=${ bakeError ? 'error' : baking ? 'busy' : 'ready' }>${ status }</span>
        <div className="variant-pills" role="radiogroup" aria-label="Break variant">${ pills }</div>
      </div>

      <div className="preview-controls">
        <button type="button" className="round-button" onClick=${ () => setPlaying( ( value ) => !value ) } aria-label=${ playing ? 'Pause' : 'Play' } disabled=${ !recording }>
          ${ playing ? html`<${ Pause } size=${ 16 } />` : html`<${ Play } size=${ 16 } />` }
        </button>
        <input
          className="scrubber"
          type="range"
          min=${ 0 }
          max=${ 1000 }
          value=${ Math.round( progress * 1000 ) }
          aria-label="Scroll position"
          style=${ { '--fill': `${ progress * 100 }%` } }
          onChange=${ ( event ) => {
            setPlaying( false )
            setProgress( Number( event.target.value ) / 1000 )
          } }
        />
        <button type="button" className="round-button" aria-pressed=${ showLabels } onClick=${ () => setShowLabels( ( value ) => !value ) } aria-label="Show all labels" title="Show all labels">
          <${ Tag } size=${ 16 } />
        </button>
        <button type="button" className="round-button" onClick=${ onReroll } aria-label="Reroll break" title="Reroll break">
          <${ ArrowsClockwise } size=${ 16 } />
        </button>
      </div>
    </div>`
}
