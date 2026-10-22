/**
 * FILE: 3d-toys/eight-ball-pool/frontend/components/html.js
 * PURPOSE: htm tagged template bound to React, JSX stand-in so page runs with no build
 * UI: every 8-Ball screen
 * USED BY: main.js, play-page.js, pool-controls.js, game-icons.js
 * KEY EXPORTS: html
 */

import { createElement } from 'react'
import htm from 'htm'

export const html = htm.bind( createElement )
