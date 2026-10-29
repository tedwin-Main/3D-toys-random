/**
 * FILE: src/features/toy-box/physics-portfolio-builder/export-site.js
 * PURPOSE: gather viewer template + draft into static site files; download as zip
 * UI: Builder > Top bar > Export zip
 * USED BY: top-bar.js
 * KEY EXPORTS: collectSiteFiles, downloadSiteZip
 */

import JSZip from 'jszip'
import { buildSiteFiles } from './site-bundle.js'
import { slugify } from './site-schema.js'
import { loadImage } from './draft-store.js'
import { TEMPLATE_FILES } from './site-template-files.js'

// builder root: viewer source files double as export template
const TEMPLATE_BASE = new URL( './', import.meta.url )

const fetchBytes = async ( url ) => {
  const response = await fetch( url )
  if ( !response.ok ) throw new Error( `${ url }: ${ response.status }` )
  return new Uint8Array( await response.arrayBuffer() )
}

// Builder > Export: template files, images, then bundle
export async function collectSiteFiles( { site, recordings } ) {
  const templateFiles = await Promise.all( TEMPLATE_FILES.map( async ( path ) => ( { path, data: await fetchBytes( new URL( path, TEMPLATE_BASE ) ) } ) ) )
  const images = []
  for ( const project of site.projects ) {
    if ( !project.image ) continue
    const blob = await loadImage( project.image )
    if ( blob ) images.push( { name: project.image, data: new Uint8Array( await blob.arrayBuffer() ) } )
  }
  return buildSiteFiles( { site, recordings, images, templateFiles } )
}

const save = ( blob, name ) => {
  const url = URL.createObjectURL( blob )
  const link = Object.assign( document.createElement( 'a' ), { href: url, download: name } )
  document.body.append( link )
  link.click()
  link.remove()
  setTimeout( () => URL.revokeObjectURL( url ), 2000 )
}

// Builder > Top bar > Export zip: folder named after site so unzip lands in one place
export async function downloadSiteZip( { site, recordings } ) {
  const files = await collectSiteFiles( { site, recordings } )
  const slug = slugify( site.name )
  const zip = new JSZip()
  const folder = zip.folder( slug )
  for ( const file of files ) folder.file( file.path, file.data )
  save( await zip.generateAsync( { type: 'blob', compression: 'DEFLATE' } ), `${ slug }.zip` )
  return files.length
}
