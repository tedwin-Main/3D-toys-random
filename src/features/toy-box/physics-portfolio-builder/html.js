/**
 * FILE: src/features/toy-box/physics-portfolio-builder/html.js
 * PURPOSE: htm tagged template bound to React, JSX stand-in so page runs with no build
 * UI: every Builder + Viewer screen
 * USED BY: builder-main.js, viewer-main.js, pages, components, builder-icons.js
 * KEY EXPORTS: html
 */

import { createElement } from 'react'
import htm from 'htm'

export const html = htm.bind( createElement )
