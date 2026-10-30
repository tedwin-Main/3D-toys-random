// Bundles viewer templates, site schema JSON, baked breaks, and images.

import { normalizeSite } from './site-schema.js'

export const TEMPLATE_ENTRY = 'viewer.html'

const escapeHtml = ( value ) => String( value )
  .replace( /&/g, '&amp;' )
  .replace( /</g, '&lt;' )
  .replace( />/g, '&gt;' )
  .replace( /"/g, '&quot;' )

const decodeText = ( data ) => typeof data === 'string' ? data : new TextDecoder().decode( data )

// Builder > Export: viewer shell gets real title + description so shared links preview right
const personalizeShell = ( html, site ) => {
  const title = escapeHtml( `${ site.name } — ${ site.headline }` )
  const description = escapeHtml( site.intro )
  return html
    .replace( /<title>[\s\S]*?<\/title>/, `<title>${ title }</title>` )
    .replace( /<meta name="description"[^>]*>/, `<meta name="description" content="${ description }">` )
    .replace( /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${ title }">` )
    .replace( /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${ description }">` )
}

// Builder > Export: every file the static site needs, paths relative to site root
export function buildSiteFiles( { site: draft, recordings, images = [], templateFiles } ) {
  if ( !recordings?.length ) throw new Error( 'Bake at least one break before exporting.' )
  const shell = templateFiles.find( ( file ) => file.path === TEMPLATE_ENTRY )
  if ( !shell ) throw new Error( 'Viewer template missing (viewer.html).' )

  const site = normalizeSite( draft )
  const used = new Set( site.projects.map( ( project ) => project.image ).filter( Boolean ) )
  const recordingPaths = recordings.map( ( _, index ) => `recordings/break-${ index + 1 }.json` )

  return [
    ...templateFiles
      .filter( ( file ) => file.path !== TEMPLATE_ENTRY )
      .map( ( file ) => ( { path: file.path, data: file.data } ) ),
    { path: 'index.html', data: personalizeShell( decodeText( shell.data ), site ) },
    { path: 'site.json', data: JSON.stringify( { ...site, recordings: recordingPaths } ) },
    ...recordings.map( ( recording, index ) => ( { path: recordingPaths[ index ], data: JSON.stringify( recording ) } ) ),
    ...images.filter( ( image ) => used.has( image.name ) ).map( ( image ) => ( { path: `images/${ image.name }`, data: image.data } ) ),
  ]
}
