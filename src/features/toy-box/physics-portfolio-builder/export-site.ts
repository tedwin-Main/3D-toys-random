// Assembles viewer template and draft data into downloadable static site zip.

import JSZip from 'jszip'
import { buildSiteFiles } from './site-bundle.ts'
import { slugify } from './site-schema.ts'
import { loadImage } from './draft-store.ts'
import { TEMPLATE_FILES } from './site-template-files.ts'

// builder root: viewer source files double as export template
const TEMPLATE_BASE = new URL( './', import.meta.url )

const fetchBytes = async ( url ) => {
  const response = await fetch( url )
  if ( !response.ok ) throw new Error( `${ url }: ${ response.status }` )
  return new Uint8Array( await response.arrayBuffer() )
}

// Builder > Export: template files, images, then bundle
// static hosts serve .ts as video/mp2t, so exported modules ship as .js (server already stripped types)
const asJs = ( path ) => path.replace( /\.ts$/, '.js' )
const jsSpecifiers = ( data ) => new TextEncoder().encode( new TextDecoder().decode( data ).replace( /([\w./-]+)\.ts(["'])/g, '$1.js$2' ) )
const templateFile = async ( path ) => {
  const data = await fetchBytes( new URL( path, TEMPLATE_BASE ) )
  return /\.(ts|html)$/.test( path ) ? { path: asJs( path ), data: jsSpecifiers( data ) } : { path, data }
}

export async function collectSiteFiles( { site, recordings } ) {
  const templateFiles = await Promise.all( TEMPLATE_FILES.map( templateFile ) )
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
