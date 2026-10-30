// Generates canvas textures for pool balls, cue ball, felt, and wood.

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

// 8-Ball > table > balls: pool ball, solids 1-8, stripes 9+, number in ivory disc both sides
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

// 8-Ball > table > balls: cue ball, ivory with two faint maker dots so spin reads
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


// 8-Ball > table > cloth + rails: felt nap or wood planks; tiled noise keeps it from looking flat
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
