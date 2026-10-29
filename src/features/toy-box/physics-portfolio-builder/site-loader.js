/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/site-loader.js
 * PURPOSE: viewer data source: published site.json + one random baked break, or builder draft (?draft=1)
 * UI: Viewer > page load
 * USED BY: viewer-main.js
 * KEY EXPORTS: loadViewerData
 */

import { decodeRecording } from './scene-recording.js'
import { normalizeSite } from './site-schema.js'
import { loadDraftRecordings, loadDraftSite, loadImage } from './draft-store.js'

const pick = ( list ) => list[ Math.floor( Math.random() * list.length ) ]

const fetchJson = async ( path ) => {
  const response = await fetch( path )
  if ( !response.ok ) throw new Error( `${ path }: ${ response.status }` )
  return response.json()
}

// Viewer > load: draft mode reads builder storage; published mode reads static files
export async function loadViewerData() {
  const draftMode = new URLSearchParams( window.location.search ).has( 'draft' )

  if ( draftMode ) {
    const site = normalizeSite( loadDraftSite() )
    const encoded = await loadDraftRecordings()
    if ( !encoded?.length ) throw new Error( 'No baked break in this browser yet. Open the builder first.' )
    const urls = new Map()
    await Promise.all( site.projects.map( async ( project ) => {
      if ( !project.image ) return
      const blob = await loadImage( project.image )
      if ( blob ) urls.set( project.image, URL.createObjectURL( blob ) )
    } ) )
    return { site, recording: decodeRecording( pick( encoded ) ), imageUrl: ( name ) => urls.get( name ) || null, draft: true }
  }

  const raw = await fetchJson( './site.json' )
  const site = normalizeSite( raw )
  const paths = Array.isArray( raw.recordings ) ? raw.recordings.filter( ( path ) => /^recordings\/[a-z0-9-]+\.json$/.test( path ) ) : []
  if ( !paths.length ) throw new Error( 'site.json lists no recordings.' )
  // one break per visit, picked at random: repeat visitors see a different scatter
  const recording = decodeRecording( await fetchJson( `./${ pick( paths ) }` ) )
  return { site, recording, imageUrl: ( name ) => `./images/${ name }`, draft: false }
}
