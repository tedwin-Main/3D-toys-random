// Binds htm tagged template to React for build-free JSX rendering.

import { createElement } from 'react'
import htm from 'htm'

export const html = htm.bind( createElement )
