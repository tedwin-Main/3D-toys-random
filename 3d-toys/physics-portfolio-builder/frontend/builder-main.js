/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/builder-main.js
 * PURPOSE: builder entry: mount builder page (fonts + styles linked in index.html)
 * UI: Builder
 * USED BY: index.html
 * KEY EXPORTS: none
 */

import { createRoot } from 'react-dom/client'
import { html } from './components/html.js'
import { BuilderPage } from './pages/builder-page.js'

createRoot( document.getElementById( 'root' ) ).render( html`<${ BuilderPage } />` )
