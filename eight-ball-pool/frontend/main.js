/**
 * FILE: 3d-toys/eight-ball-pool/frontend/main.js
 * PURPOSE: 8-Ball entry: mount game (fonts + styles linked from index.html)
 * UI: 8-Ball
 * USED BY: eight-ball-pool/index.html
 * KEY EXPORTS: none
 */

import { createRoot } from 'react-dom/client'
import { html } from './components/html.js'
import { PlayPage } from './pages/play-page.js'

// Toy Box > viewer: gallery nav pill sits over top centre, so HUD drops below it when framed
document.documentElement.dataset.embedded = String( window.self !== window.top )

createRoot( document.getElementById( 'root' ) ).render( html`<${ PlayPage } />` )
