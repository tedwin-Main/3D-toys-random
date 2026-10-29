/**
 * FILE: src/features/toy-box/physics-portfolio-builder/image-upload.js
 * PURPOSE: shrink uploaded project image to max 1600 px WebP, store in IndexedDB, return file name
 * UI: Builder > Projects > card > Image dropzone
 * USED BY: project-editor.js
 * KEY EXPORTS: importProjectImage
 */

import { saveImage } from './draft-store.js'

const MAX_EDGE = 1600
const ACCEPTED = /^image\/(png|jpe?g|webp|gif|avif)$/

const randomName = () => `img-${ Date.now().toString( 36 ) }-${ Math.random().toString( 36 ).slice( 2, 8 ) }.webp`

// Builder > Projects > Image: decode, scale down, encode WebP (falls back to PNG if browser lacks WebP encode)
export async function importProjectImage( file ) {
  if ( !ACCEPTED.test( file.type ) ) throw new Error( 'Use a PNG, JPG, WebP, GIF or AVIF image.' )
  if ( file.size > 25 * 1024 * 1024 ) throw new Error( 'Image over 25 MB.' )
  const bitmap = await createImageBitmap( file )
  const scale = Math.min( 1, MAX_EDGE / Math.max( bitmap.width, bitmap.height ) )
  const canvas = document.createElement( 'canvas' )
  canvas.width = Math.round( bitmap.width * scale )
  canvas.height = Math.round( bitmap.height * scale )
  canvas.getContext( '2d' ).drawImage( bitmap, 0, 0, canvas.width, canvas.height )
  bitmap.close?.()
  let blob = await new Promise( ( resolve ) => canvas.toBlob( resolve, 'image/webp', 0.86 ) )
  let name = randomName()
  if ( !blob || blob.type !== 'image/webp' ) {
    blob = await new Promise( ( resolve ) => canvas.toBlob( resolve, 'image/png' ) )
    name = name.replace( /\.webp$/, '.png' )
  }
  await saveImage( name, blob )
  return { name, blob }
}
