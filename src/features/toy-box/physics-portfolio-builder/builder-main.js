// Mounts portfolio builder web application into root container.

import { createRoot } from 'react-dom/client'
import { html } from './html.js'
import { BuilderPage } from './builder-page.js'

createRoot( document.getElementById( 'root' ) ).render( html`<${ BuilderPage } />` )
