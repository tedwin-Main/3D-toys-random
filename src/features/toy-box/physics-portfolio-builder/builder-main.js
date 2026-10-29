/**
 * FILE: src/features/toy-box/physics-portfolio-builder/builder-main.js
 * PURPOSE: builder entry: mount builder page (fonts + styles linked in index.html)
 * UI: Builder
 * USED BY: index.html
 * KEY EXPORTS: none
 */

import { createRoot } from 'react-dom/client'
import { html } from './html.js'
import { BuilderPage } from './builder-page.js'

createRoot( document.getElementById( 'root' ) ).render( html`<${ BuilderPage } />` )
