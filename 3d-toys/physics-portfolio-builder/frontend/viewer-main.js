/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/viewer-main.js
 * PURPOSE: viewer entry: fetch site data, mount page or error card (fonts + styles linked in viewer.html)
 * UI: Viewer
 * USED BY: viewer.html
 * KEY EXPORTS: none
 */

import { createRoot } from 'react-dom/client'
import { html } from './components/html.js'
import { ViewerPage } from './pages/viewer-page.js'
import { loadViewerData } from './components/site-loader.js'

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
