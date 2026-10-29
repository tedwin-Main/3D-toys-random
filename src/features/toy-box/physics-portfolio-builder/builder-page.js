/**
 * FILE: src/features/toy-box/physics-portfolio-builder/builder-page.js
 * PURPOSE: builder shell: draft state, autosave, bake on scene change, image URLs, three-panel layout
 * UI: Builder (whole page)
 * USED BY: builder-main.js
 * KEY EXPORTS: BuilderPage
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { html } from './html.js'
import { PRESET_INFO } from './preset-info.js'
import { decodeRecording } from './scene-recording.js'
import { createDefaultSite, createProject, normalizeSite } from './site-schema.js'
import { bakeVariants, VARIANT_COUNT } from './bake-client.js'
import { deleteImage, loadDraftSite, loadImage, saveDraftRecordings, saveDraftSite } from './draft-store.js'
import { PreviewPanel } from './preview-panel.js'
import { ProjectEditor } from './project-editor.js'
import { StyleEditor } from './style-editor.js'
import { TopBar } from './top-bar.js'

const initialDraft = () => {
  const stored = loadDraftSite()
  return stored ? { ...createDefaultSite(), ...stored, projects: normalizeSite( stored ).projects } : createDefaultSite()
}

export function BuilderPage() {
  // raw draft: half-typed links kept while editing; normalized copy feeds preview + export
  const [ draft, setDraft ] = useState( initialDraft )
  const [ recordings, setRecordings ] = useState( [] )
  const [ variant, setVariant ] = useState( 0 )
  const [ baking, setBaking ] = useState( false )
  const [ bakeError, setBakeError ] = useState( '' )
  const [ openId, setOpenId ] = useState( null )
  const [ imageUrls, setImageUrls ] = useState( {} )
  const bakeTicket = useRef( 0 )

  const site = useMemo( () => normalizeSite( draft ), [ draft ] )
  // typing must not rebuild scene textures per keystroke: preview trails edits by 220 ms
  const [ previewSite, setPreviewSite ] = useState( site )
  useEffect( () => {
    const timer = setTimeout( () => setPreviewSite( site ), 220 )
    return () => clearTimeout( timer )
  }, [ site ] )
  const update = useCallback( ( patch ) => setDraft( ( current ) => ( { ...current, ...patch } ) ), [] )

  // Builder > autosave: draft to localStorage 300 ms after last edit
  useEffect( () => {
    const timer = setTimeout( () => saveDraftSite( draft ), 300 )
    return () => clearTimeout( timer )
  }, [ draft ] )

  // Builder > Preview: bake when scene, project count or seed changes; stale bakes dropped
  const projectCount = site.projects.length
  useEffect( () => {
    const ticket = ++bakeTicket.current
    setBaking( true )
    setBakeError( '' )
    const timer = setTimeout( () => {
      bakeVariants( { preset: site.preset, projectCount, seed: site.seed } )
        .then( ( encoded ) => {
          if ( ticket !== bakeTicket.current ) return
          setRecordings( encoded )
          setVariant( 0 )
          saveDraftRecordings( encoded )
        } )
        .catch( ( error ) => ticket === bakeTicket.current && setBakeError( error.message ) )
        .finally( () => ticket === bakeTicket.current && setBaking( false ) )
    }, 180 )
    return () => clearTimeout( timer )
  }, [ site.preset, projectCount, site.seed ] )

  const recording = useMemo( () => recordings[ variant ] ? decodeRecording( recordings[ variant ] ) : null, [ recordings, variant ] )

  // Builder > Projects > images: object URLs for stored blobs, revoked on unmount
  const imageNames = site.projects.map( ( project ) => project.image ).filter( Boolean ).join( '|' )
  useEffect( () => {
    let cancelled = false
    const names = imageNames ? imageNames.split( '|' ) : []
    const missing = names.filter( ( name ) => !imageUrls[ name ] )
    if ( !missing.length ) return undefined
    Promise.all( missing.map( async ( name ) => [ name, await loadImage( name ) ] ) ).then( ( entries ) => {
      if ( cancelled ) return
      const next = {}
      for ( const [ name, blob ] of entries ) if ( blob ) next[ name ] = URL.createObjectURL( blob )
      setImageUrls( ( current ) => ( { ...current, ...next } ) )
    } )
    return () => { cancelled = true }
  }, [ imageNames ] )
  useEffect( () => () => Object.values( imageUrls ).forEach( ( url ) => URL.revokeObjectURL( url ) ), [] )

  const setProjects = ( change ) => setDraft( ( current ) => ( { ...current, projects: change( current.projects ) } ) )

  // Builder > Projects > Add
  const addProject = () => {
    const project = createProject( draft.projects.length )
    setProjects( ( projects ) => [ ...projects, project ] )
    setOpenId( project.id )
  }

  // Builder > Projects > card fields
  const updateProject = ( id, patch ) => setProjects( ( projects ) => projects.map( ( project ) => project.id === id ? { ...project, ...patch } : project ) )

  // Builder > Projects > arrows
  const moveProject = ( id, direction ) => setProjects( ( projects ) => {
    const index = projects.findIndex( ( project ) => project.id === id )
    const target = index + direction
    if ( index < 0 || target < 0 || target >= projects.length ) return projects
    const next = [ ...projects ]
    ;[ next[ index ], next[ target ] ] = [ next[ target ], next[ index ] ]
    return next
  } )

  // Builder > Projects > drag over another card: take its slot
  const reorderProject = ( dragId, overId ) => setProjects( ( projects ) => {
    const from = projects.findIndex( ( project ) => project.id === dragId )
    const to = projects.findIndex( ( project ) => project.id === overId )
    if ( from < 0 || to < 0 || from === to ) return projects
    const next = [ ...projects ]
    next.splice( to, 0, next.splice( from, 1 )[ 0 ] )
    return next
  } )

  // Builder > Projects > Remove (image blob freed too)
  const removeProject = ( id ) => {
    const project = draft.projects.find( ( item ) => item.id === id )
    if ( project?.image ) deleteImage( project.image )
    setProjects( ( projects ) => projects.filter( ( item ) => item.id !== id ) )
  }

  // Builder > Projects > Image set or cleared
  const setProjectImage = ( id, name, blob ) => {
    const previous = draft.projects.find( ( item ) => item.id === id )?.image
    if ( previous && previous !== name ) deleteImage( previous )
    if ( name && blob ) setImageUrls( ( current ) => ( { ...current, [ name ]: URL.createObjectURL( blob ) } ) )
    updateProject( id, { image: name } )
  }

  return html`
    <div className="builder">
      <${ TopBar } site=${ site } recordings=${ recordings } onBeforePreview=${ () => saveDraftSite( draft ) } />

      <aside className="panel panel-left" aria-label="Projects">
        <${ ProjectEditor }
          projects=${ draft.projects }
          maxProjects=${ PRESET_INFO[ site.preset ].maxProjects }
          openId=${ openId }
          onOpen=${ setOpenId }
          imageUrls=${ imageUrls }
          onAdd=${ addProject }
          onUpdate=${ updateProject }
          onMove=${ moveProject }
          onReorder=${ reorderProject }
          onRemove=${ removeProject }
          onImage=${ setProjectImage }
        />
      </aside>

      <main className="preview" aria-label="Preview">
        <${ PreviewPanel }
          site=${ previewSite }
          recording=${ recording }
          variantCount=${ recordings.length || VARIANT_COUNT }
          variant=${ variant }
          onVariant=${ setVariant }
          onReroll=${ () => update( { seed: 1 + Math.floor( Math.random() * 1e6 ) } ) }
          baking=${ baking }
          bakeError=${ bakeError }
          onSelect=${ ( index ) => setOpenId( draft.projects[ index ]?.id ?? null ) }
        />
      </main>

      <aside className="panel panel-right" aria-label="Style">
        <${ StyleEditor } site=${ draft } onChange=${ update } />
      </aside>
    </div>`
}
