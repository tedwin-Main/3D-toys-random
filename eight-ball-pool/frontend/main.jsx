/**
 * FILE: 3d-toys/eight-ball-pool/frontend/main.jsx
 * PURPOSE: 8-ball entry: fonts, styles, mount game
 * UI: Play
 * USED BY: frontend/index.html
 * KEY EXPORTS: none
 */

import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './components/play.css'
import { PlayPage } from './pages/play-page.jsx'

createRoot( document.getElementById( 'root' ) ).render( <PlayPage /> )
