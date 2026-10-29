/**
 * FILE: src/features/toy-box/physics-portfolio-builder/body-textures.js
 * PURPOSE: canvas textures for bodies (pool balls, marbles, domino faces) and surfaces (felt, wood, marble ring)
 * UI: Viewer > Hero scene, Builder > Preview scene
 * USED BY: scene-renderer.js
 * KEY EXPORTS: poolBallTexture, cueBallTexture, marbleTexture, dominoTexture, surfaceTexture
 */

import * as THREE from 'three'
import { createRandom } from './seeded-random.js'

const IVORY = '#f6f2e8'
const INK = '#111214'

const makeCanvas = ( width, height ) => {
  const canvas = document.createElement( 'canvas' )
  canvas.width = width
  canvas.height = height
  return { canvas, context: canvas.getContext( '2d' ) }
}

// Run engine: wrap canvas as sRGB texture; repaint once webfont lands (canvas text falls back silently)
const toTexture = ( canvas, paint, font, onRepaint ) => {
  const texture = new THREE.CanvasTexture( canvas )
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  paint()
  if ( font && document.fonts?.load ) {
    document.fonts.load( font ).then( () => {
      paint()
      texture.needsUpdate = true
      onRepaint?.()
    } ).catch( () => {} )
  }
  return texture
}

// Preview > pool ball: solids 1-8, stripes 9+, number in ivory disc both sides
export const poolBallTexture = ( number, color, fontFamily, onRepaint ) => {
  const { canvas, context } = makeCanvas( 1024, 512 )
  const font = `700 88px ${ fontFamily }`
  const paint = () => {
    const stripe = number > 8
    context.fillStyle = stripe ? IVORY : color
    context.fillRect( 0, 0, 1024, 512 )
    if ( stripe ) {
      context.fillStyle = color
      context.fillRect( 0, 120, 1024, 272 )
    }
    for ( const centerX of [ 256, 768 ] ) {
      context.fillStyle = IVORY
      context.beginPath()
      context.arc( centerX, 256, 82, 0, Math.PI * 2 )
      context.fill()
      context.fillStyle = INK
      context.font = font
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText( String( number ), centerX, 262 )
    }
  }
  return toTexture( canvas, paint, font, onRepaint )
}

// Preview > cue ball: ivory with two faint maker dots so spin reads
export const cueBallTexture = () => {
  const { canvas, context } = makeCanvas( 512, 256 )
  const paint = () => {
    context.fillStyle = IVORY
    context.fillRect( 0, 0, 512, 256 )
    context.fillStyle = '#c4442b'
    for ( const x of [ 128, 384 ] ) {
      context.beginPath()
      context.arc( x, 128, 9, 0, Math.PI * 2 )
      context.fill()
    }
  }
  return toTexture( canvas, paint )
}

// Preview > marble: tinted glass base, seeded white swirl ribbons
export const marbleTexture = ( color, seed ) => {
  const { canvas, context } = makeCanvas( 512, 256 )
  const random = createRandom( seed * 97 + 13 )
  const paint = () => {
    const gradient = context.createLinearGradient( 0, 0, 0, 256 )
    gradient.addColorStop( 0, color )
    gradient.addColorStop( 0.5, new THREE.Color( color ).offsetHSL( 0, 0.05, 0.12 ).getStyle() )
    gradient.addColorStop( 1, color )
    context.fillStyle = gradient
    context.fillRect( 0, 0, 512, 256 )
    context.lineCap = 'round'
    for ( let ribbon = 0; ribbon < 3; ribbon += 1 ) {
      context.strokeStyle = `rgba(255,255,255,${ 0.55 + random() * 0.3 })`
      context.lineWidth = 10 + random() * 18
      context.beginPath()
      const phase = random() * Math.PI * 2
      const height = 60 + random() * 70
      for ( let x = 0; x <= 512; x += 8 ) {
        const y = 128 + Math.sin( ( x / 512 ) * Math.PI * 4 + phase ) * height * 0.5
        if ( x === 0 ) context.moveTo( x, y )
        else context.lineTo( x, y )
      }
      context.stroke()
    }
  }
  return toTexture( canvas, paint )
}

// Preview > domino face: project colour, initial over divider, pip count under it
export const dominoTexture = ( color, initial, pips, fontFamily, onRepaint ) => {
  const { canvas, context } = makeCanvas( 256, 512 )
  const font = `700 150px ${ fontFamily }`
  const paint = () => {
    context.fillStyle = color
    context.fillRect( 0, 0, 256, 512 )
    context.fillStyle = 'rgba(255,255,255,0.9)'
    context.fillRect( 28, 252, 200, 8 )
    context.font = font
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText( initial, 128, 136 )
    const layout = [ [], [ [ 0, 0 ] ], [ [ -1, -1 ], [ 1, 1 ] ], [ [ -1, -1 ], [ 0, 0 ], [ 1, 1 ] ],
      [ [ -1, -1 ], [ 1, -1 ], [ -1, 1 ], [ 1, 1 ] ], [ [ -1, -1 ], [ 1, -1 ], [ 0, 0 ], [ -1, 1 ], [ 1, 1 ] ],
      [ [ -1, -1 ], [ 1, -1 ], [ -1, 0 ], [ 1, 0 ], [ -1, 1 ], [ 1, 1 ] ] ][ pips % 7 ]
    for ( const [ px, py ] of layout ) {
      context.beginPath()
      context.arc( 128 + px * 58, 384 + py * 70, 18, 0, Math.PI * 2 )
      context.fill()
    }
  }
  return toTexture( canvas, paint, font, onRepaint )
}

// Preview > surface: felt nap, wood planks, or chalk ring on stone; tiled noise keeps it from looking flat
export const surfaceTexture = ( kind, color ) => {
  const size = 512
  const { canvas, context } = makeCanvas( size, size )
  const random = createRandom( 4242 )
  const base = new THREE.Color( color )
  const paint = () => {
    context.fillStyle = base.getStyle()
    context.fillRect( 0, 0, size, size )
    if ( kind === 'wood' ) {
      const planks = 6
      for ( let plank = 0; plank < planks; plank += 1 ) {
        const shade = base.clone().offsetHSL( 0, 0, ( random() - 0.5 ) * 0.08 )
        context.fillStyle = shade.getStyle()
        context.fillRect( plank * ( size / planks ), 0, size / planks - 2, size )
        context.strokeStyle = 'rgba(0,0,0,0.06)'
        for ( let grain = 0; grain < 14; grain += 1 ) {
          const x = plank * ( size / planks ) + random() * ( size / planks )
          context.lineWidth = 1 + random() * 2
          context.beginPath()
          context.moveTo( x, 0 )
          context.bezierCurveTo( x + 6, size * 0.3, x - 6, size * 0.6, x, size )
          context.stroke()
        }
      }
    }
    const image = context.getImageData( 0, 0, size, size )
    const strength = kind === 'felt' ? 14 : 8
    for ( let index = 0; index < image.data.length; index += 4 ) {
      const grain = ( random() - 0.5 ) * strength
      image.data[ index ] += grain
      image.data[ index + 1 ] += grain
      image.data[ index + 2 ] += grain
    }
    context.putImageData( image, 0, 0 )
  }
  const texture = toTexture( canvas, paint )
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}
