/**
 * FILE: src/features/toy-box/physics-portfolio-builder/site-template-files.test.js
 * PURPOSE: export template list matches every local file reachable from viewer.html
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, normalize, relative } from 'node:path'
import { TEMPLATE_FILES } from './site-template-files.js'

const ROOT = import.meta.dirname
// html: plain relative paths; js: only ./ ../ (bare names go through import map to CDN)
const isLocal = ( spec, fromHtml ) => fromHtml ? !spec.includes( ':' ) && /\.(js|css)$/.test( spec ) : spec.startsWith( '.' )

// Run engine: walk html src/href + js static imports from viewer.html
const reachable = () => {
  const seen = new Set()
  const visit = ( path ) => {
    if ( seen.has( path ) ) return
    seen.add( path )
    const text = readFileSync( join( ROOT, path ), 'utf8' )
    const specs = path.endsWith( '.html' )
      ? [ ...text.matchAll( /(?:src|href)="([^"]+)"/g ) ].map( ( match ) => match[ 1 ] )
      : path.endsWith( '.js' ) ? [ ...text.matchAll( /^import[^'"]*['"]([^'"]+)['"]/gm ) ].map( ( match ) => match[ 1 ] ) : []
    for ( const spec of specs.filter( ( spec ) => isLocal( spec, path.endsWith( '.html' ) ) ) ) visit( relative( ROOT, normalize( join( ROOT, dirname( path ), spec ) ) ) )
  }
  visit( 'viewer.html' )
  return seen
}

test( 'template list = files reachable from viewer.html', () => {
  assert.deepEqual( [ ...reachable() ].sort(), [ ...TEMPLATE_FILES ].sort() )
} )
