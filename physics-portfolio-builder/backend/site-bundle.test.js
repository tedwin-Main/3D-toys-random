/**
 * FILE: 3d-toys/physics-portfolio-builder/backend/site-bundle.test.js
 * PURPOSE: site schema sanitizing and static bundle assembly
 * UI: none
 * USED BY: npm test (3d-toys root)
 * KEY EXPORTS: none
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSiteFiles } from './site-bundle.js'
import { createDefaultSite, normalizeSite, slugify } from './site-schema.js'

const template = [
  { path: 'viewer.html', data: '<html><head><title>x</title><meta name="description" content=""><meta property="og:title" content=""><meta property="og:description" content=""></head></html>' },
  { path: 'assets/viewer-abc.js', data: 'console.log(1)' },
]

test( 'normalizeSite drops unsafe links and unknown options', () => {
  const site = normalizeSite( {
    preset: 'bowling',
    palette: 'neon',
    projects: [ { title: 'A', link: 'javascript:alert(1)', color: 'red', image: '../../etc/passwd' } ],
    contacts: [ { label: 'Mail', url: 'mailto:a@b.co' }, { label: 'Bad', url: 'data:text/html,hi' } ],
  } )
  assert.equal( site.preset, 'pool' )
  assert.equal( site.palette, 'felt' )
  assert.equal( site.projects[ 0 ].link, '' )
  assert.equal( site.projects[ 0 ].image, null )
  assert.match( site.projects[ 0 ].color, /^#[0-9a-f]{6}$/i )
  assert.deepEqual( site.contacts, [ { label: 'Mail', url: 'mailto:a@b.co' } ] )
} )

test( 'normalizeSite caps projects at preset limit', () => {
  const projects = Array.from( { length: 40 }, ( _, index ) => ( { title: `P${ index }` } ) )
  assert.equal( normalizeSite( { preset: 'pool', projects } ).projects.length, 15 )
  assert.equal( normalizeSite( { preset: 'marbles', projects } ).projects.length, 24 )
} )

test( 'slugify makes url-safe names', () => {
  assert.equal( slugify( 'Ted Win — Portfolio!' ), 'ted-win-portfolio' )
  assert.equal( slugify( '***' ), 'portfolio' )
} )

test( 'bundle: index.html personalized, recordings + used images only', () => {
  const site = createDefaultSite()
  site.name = 'Ada <Lovelace>'
  site.projects[ 0 ].image = 'img-one.webp'
  const files = buildSiteFiles( {
    site,
    recordings: [ { version: 1 }, { version: 1 } ],
    images: [ { name: 'img-one.webp', data: new Uint8Array( [ 1 ] ) }, { name: 'img-unused.webp', data: new Uint8Array( [ 2 ] ) } ],
    templateFiles: template,
  } )
  const paths = files.map( ( file ) => file.path ).sort()
  assert.deepEqual( paths, [ 'assets/viewer-abc.js', 'images/img-one.webp', 'index.html', 'recordings/break-1.json', 'recordings/break-2.json', 'site.json' ] )
  const html = files.find( ( file ) => file.path === 'index.html' ).data
  assert.match( html, /<title>Ada &lt;Lovelace&gt; — /, 'title escaped' )
  const siteJson = JSON.parse( files.find( ( file ) => file.path === 'site.json' ).data )
  assert.deepEqual( siteJson.recordings, [ 'recordings/break-1.json', 'recordings/break-2.json' ] )
} )

test( 'bundle refuses without recordings or template', () => {
  assert.throws( () => buildSiteFiles( { site: createDefaultSite(), recordings: [], templateFiles: template } ), /Bake/ )
  assert.throws( () => buildSiteFiles( { site: createDefaultSite(), recordings: [ {} ], templateFiles: [] } ), /template/ )
} )
