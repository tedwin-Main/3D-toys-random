/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/break-stage.js
 * PURPOSE: React shell for scene renderer: canvas, projected project labels (also keyboard targets), WebGL fallback
 * UI: Viewer > Hero > stage, Builder > Preview > stage
 * USED BY: viewer-page.js, preview-panel.js
 * KEY EXPORTS: BreakStage, declutterLabels
 */

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { html } from './html.js'
import { createSceneRenderer } from './scene-renderer.js'

const LABEL_GAP = 4
const MAX_STEPS = 4

// Hero > settled table > labels: nudge overlapping pills up/down, smallest move wins (balls cluster on phones)
export function declutterLabels( labels, container ) {
  // read all sizes before any style write so layout recalcs once
  const boxes = []
  for ( const label of labels ) {
    const element = container.children[ label.project ]
    if ( !element || label.opacity <= 0.5 ) continue
    boxes.push( { project: label.project, x: label.x, y: label.y, width: element.offsetWidth, height: element.offsetHeight } )
  }
  boxes.sort( ( a, b ) => b.y - a.y )
  const placed = []
  const shifts = new Map()
  const overlaps = ( box, y ) => placed.some( ( other ) =>
    Math.abs( box.x - other.x ) * 2 < box.width + other.width + LABEL_GAP * 2
    && y > other.y - other.height - LABEL_GAP && y - box.height - LABEL_GAP < other.y )
  for ( const box of boxes ) {
    const step = box.height + LABEL_GAP
    const candidates = [ 0 ]
    for ( let n = 1; n <= MAX_STEPS; n += 1 ) candidates.push( -n * step, n * step )
    const shift = candidates.find( ( offset ) => !overlaps( box, box.y + offset ) ) ?? 0
    placed.push( { ...box, y: box.y + shift } )
    if ( shift ) shifts.set( box.project, shift )
  }
  return shifts
}

export const BreakStage = forwardRef( function BreakStage( { recording, site, onSelect, showAllLabels = 'auto', className = '' }, ref ) {
  const canvasRef = useRef( null )
  const labelsRef = useRef( null )
  const rendererRef = useRef( null )
  const onSelectRef = useRef( onSelect )
  const [ failed, setFailed ] = useState( false )
  onSelectRef.current = onSelect

  useLayoutEffect( () => {
    let renderer
    try {
      renderer = createSceneRenderer( {
        canvas: canvasRef.current,
        onSelect: ( index ) => onSelectRef.current?.( index ),
        // labels move every frame: write DOM directly, no React render
        onLabels: ( labels, state ) => {
          const container = labelsRef.current
          if ( !container ) return
          container.dataset.settled = state.settled ? 'true' : 'false'
          const shifts = state.settled ? declutterLabels( labels, container ) : null
          for ( const label of labels ) {
            const element = container.children[ label.project ]
            if ( !element ) continue
            const y = label.y + ( shifts?.get( label.project ) ?? 0 )
            element.style.transform = `translate3d(${ label.x.toFixed( 1 ) }px, ${ y.toFixed( 1 ) }px, 0) translate(-50%, -100%)`
            element.style.opacity = label.opacity.toFixed( 3 )
            element.tabIndex = state.settled ? 0 : -1
            element.dataset.active = label.active ? 'true' : 'false'
            // visible settled labels take clicks too, faded ones let pointer reach canvas
            element.dataset.visible = state.settled && label.opacity > 0.5 ? 'true' : 'false'
          }
        },
      } )
      rendererRef.current = renderer
      renderer.resize()
    } catch ( error ) {
      console.warn( 'WebGL stage unavailable:', error )
      setFailed( true )
    }
    return () => {
      renderer?.dispose()
      rendererRef.current = null
    }
  }, [] )

  useEffect( () => {
    if ( recording && site ) rendererRef.current?.setScene( { recording, site } )
  }, [ recording, site ] )

  useEffect( () => {
    rendererRef.current?.setShowAllLabels( showAllLabels )
  }, [ showAllLabels ] )

  useImperativeHandle( ref, () => ( {
    setProgress: ( progress ) => rendererRef.current?.setProgress( progress ),
  } ), [] )

  if ( failed ) {
    return html`
      <div className=${ `stage stage-fallback ${ className }` }>
        <p>3D scene unavailable on this device. Pick a project:</p>
        <ul>
          ${ site?.projects.map( ( project, index ) => html`
            <li key=${ project.id }><button type="button" onClick=${ () => onSelect?.( index ) }>${ project.title }</button></li>` ) }
        </ul>
      </div>`
  }

  // Hero > settled table > label: keyboard twin of clicking ball
  const labels = site?.projects.map( ( project, index ) => html`
    <button
      key=${ project.id }
      type="button"
      className="stage-label"
      tabIndex=${ -1 }
      style=${ { '--label-color': project.color } }
      onFocus=${ () => rendererRef.current?.focusProject( index ) }
      onBlur=${ () => rendererRef.current?.focusProject( -1 ) }
      onClick=${ () => onSelect?.( index ) }
    >
      <span className="stage-label-dot" aria-hidden="true" />
      ${ project.title }
    </button>` )

  return html`
    <div className=${ `stage ${ className }` }>
      <canvas ref=${ canvasRef } className="stage-canvas" />
      <div ref=${ labelsRef } className="stage-labels" data-settled="false">${ labels }</div>
    </div>`
} )
