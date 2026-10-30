// Mounts 8-Ball pool game into root container.

import { createRoot } from 'react-dom/client'
import { html } from './html.js'
import { PlayPage } from './play-page.js'

// Toy Box > viewer: gallery nav pill sits over top centre, so HUD drops below it when framed
document.documentElement.dataset.embedded = String( window.self !== window.top )

createRoot( document.getElementById( 'root' ) ).render( html`<${ PlayPage } />` )
