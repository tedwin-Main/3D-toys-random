// Mounts portfolio builder web application into root container.

import { createRoot } from 'react-dom/client'
import { html } from './html.ts'
import { BuilderPage } from './builder-page.ts'

createRoot( document.getElementById( 'root' ) ).render( html`<${ BuilderPage } />` )
