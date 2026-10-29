/**
 * FILE: src/features/toy-box/physics-portfolio-builder/project-grid.js
 * PURPOSE: plain list of all projects under the break (also the no-WebGL / reduced-motion path)
 * UI: Viewer > Work section
 * USED BY: viewer-page.js
 * KEY EXPORTS: ProjectGrid
 */

import { html } from './html.js'
import { ArrowRight } from './builder-icons.js'

export function ProjectGrid( { projects, imageUrl, onOpen } ) {
  // Viewer > Work > row: open project drawer
  const rows = projects.map( ( project, index ) => {
    const image = project.image ? imageUrl( project.image ) : null
    return html`
      <li key=${ project.id } style=${ { '--project-color': project.color } }>
        <button type="button" className="work-row" onClick=${ () => onOpen( index ) }>
          <span className="work-index">${ String( index + 1 ).padStart( 2, '0' ) }</span>
          <span className="work-thumb" aria-hidden="true">
            ${ image ? html`<img src=${ image } alt="" loading="lazy" />` : html`<span>${ project.title.slice( 0, 1 ) }</span>` }
          </span>
          <span className="work-title">${ project.title }</span>
          <span className="work-tagline">${ project.tagline }</span>
          <span className="work-year">${ project.year }</span>
          <${ ArrowRight } className="work-arrow" size=${ 20 } />
        </button>
      </li>`
  } )

  return html`<ol className="work-list">${ rows }</ol>`
}
