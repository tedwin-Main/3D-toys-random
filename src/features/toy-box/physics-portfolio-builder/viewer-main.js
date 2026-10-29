/**
 * FILE: src/features/toy-box/physics-portfolio-builder/viewer-main.js
 * PURPOSE: viewer entry: fetch site data, mount page or error card (fonts + styles linked in viewer.html)
 * UI: Viewer
 * USED BY: viewer.html
 * KEY EXPORTS: none
 */

import { createRoot } from 'react-dom/client'
import { html } from './html.js'
import { ViewerPage } from './viewer-page.js'
import { loadViewerData } from './site-loader.js'

const root = createRoot( document.getElementById( 'root' ) )

// Viewer > load: page once data lands, plain error card if site.json missing
loadViewerData()
  .then( ( data ) => root.render( html`<${ ViewerPage } ...${ data } />` ) )
  .catch( ( error ) => {
    console.error( error )
    root.render( html`
      <main className="load-error">
        <h1>Site could not load</h1>
        <p>${ error.message }</p>
      </main>` )
  } )
