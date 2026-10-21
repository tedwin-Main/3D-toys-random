/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/project-drawer.js
 * PURPOSE: side panel with one project's image, details and outbound link
 * UI: Viewer > Project drawer (opened from ball click, label, or work grid)
 * USED BY: viewer-page.js
 * KEY EXPORTS: ProjectDrawer
 */

import { Fragment, useEffect, useRef } from 'react'
import { html } from './html.js'
import { ArrowUpRight, X } from './builder-icons.js'

export function ProjectDrawer( { project, index, total, imageUrl, onClose, onStep } ) {
  const closeRef = useRef( null )
  const returnFocus = useRef( null )
  const open = Boolean( project )

  // Viewer > Drawer: focus close on open, give focus back on close
  useEffect( () => {
    if ( !open ) return undefined
    returnFocus.current = document.activeElement
    closeRef.current?.focus( { preventScroll: true } )
    return () => returnFocus.current?.focus?.( { preventScroll: true } )
  }, [ open ] )

  // Viewer > Drawer > keys: Esc closes, arrows step projects
  useEffect( () => {
    if ( !open ) return undefined
    const onKey = ( event ) => {
      if ( event.key === 'Escape' ) onClose()
      if ( event.key === 'ArrowRight' ) onStep( 1 )
      if ( event.key === 'ArrowLeft' ) onStep( -1 )
    }
    window.addEventListener( 'keydown', onKey )
    return () => window.removeEventListener( 'keydown', onKey )
  }, [ open, onClose, onStep ] )

  const image = project?.image ? imageUrl( project.image ) : null

  const body = project && html`
    <${ Fragment }>
      <div className="drawer-top">
        <span className="drawer-count">${ String( index + 1 ).padStart( 2, '0' ) } / ${ String( total ).padStart( 2, '0' ) }</span>
        <button ref=${ closeRef } type="button" className="icon-button" onClick=${ onClose } aria-label="Close project">
          <${ X } size=${ 18 } />
        </button>
      </div>
      <div className="drawer-media">
        ${ image
          ? html`<img src=${ image } alt="" />`
          : html`<span className="drawer-media-initial" aria-hidden="true">${ project.title.slice( 0, 1 ) }</span>` }
      </div>
      <div className="drawer-body">
        ${ project.year && html`<p className="drawer-year">${ project.year }</p>` }
        <h2 className="drawer-title">${ project.title }</h2>
        ${ project.tagline && html`<p className="drawer-tagline">${ project.tagline }</p>` }
        ${ project.description.split( /\n{2,}/ ).filter( Boolean ).map( ( paragraph, paragraphIndex ) => html`
          <p key=${ paragraphIndex } className="drawer-text">${ paragraph }</p>` ) }
        ${ project.link && html`
          <a className="drawer-link" href=${ project.link } target="_blank" rel="noreferrer noopener">
            Visit project <${ ArrowUpRight } size=${ 16 } />
          </a>` }
      </div>
      <div className="drawer-steps">
        <button type="button" onClick=${ () => onStep( -1 ) }>Previous</button>
        <button type="button" onClick=${ () => onStep( 1 ) }>Next</button>
      </div>
    <//>`

  return html`
    <div className="drawer-root" data-open=${ open } aria-hidden=${ !open }>
      <button type="button" className="drawer-scrim" tabIndex=${ -1 } aria-label="Close project" onClick=${ onClose } />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label=${ project?.title || 'Project' } style=${ { '--project-color': project?.color } }>
        ${ body }
      </aside>
    </div>`
}
