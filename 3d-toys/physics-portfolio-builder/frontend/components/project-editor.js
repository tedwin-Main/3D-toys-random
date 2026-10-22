/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/project-editor.js
 * PURPOSE: project list editor: add, remove, reorder (drag or arrows), edit fields, colour, image upload
 * UI: Builder > Projects panel
 * USED BY: builder-page.js
 * KEY EXPORTS: ProjectEditor
 */

import { useEffect, useRef, useState } from 'react'
import { html } from './html.js'
import { ArrowDown, ArrowUp, DotsSixVertical, ImageSquare, Plus, Trash, X } from './builder-icons.js'
import { PROJECT_COLORS } from '../../backend/site-schema.js'
import { importProjectImage } from './image-upload.js'

const Field = ( { label, children } ) => html`
  <label className="field">
    <span className="field-label">${ label }</span>
    ${ children }
  </label>`

// Builder > Projects > card: one project, collapsed row or open form
function ProjectCard( { project, index, count, open, imageUrl, onToggle, onChange, onMove, onRemove, onImage, dragProps } ) {
  const fileRef = useRef( null )
  const [ error, setError ] = useState( '' )
  const cardRef = useRef( null )

  // Builder > Preview > click ball: matching card scrolls into view
  useEffect( () => {
    if ( open ) cardRef.current?.scrollIntoView( { block: 'nearest', behavior: 'smooth' } )
  }, [ open ] )

  // Builder > Projects > Image: upload, shrink, store
  const upload = async ( file ) => {
    if ( !file ) return
    setError( '' )
    try {
      const { name, blob } = await importProjectImage( file )
      onImage( name, blob )
    } catch ( uploadError ) {
      setError( uploadError.message )
    }
  }

  // Builder > Projects > Image: preview with remove, or dropzone
  const imageSlot = imageUrl
    ? html`
      <div className="image-preview">
        <img src=${ imageUrl } alt="" />
        <button type="button" className="mini-button image-remove" onClick=${ () => onImage( null ) } aria-label="Remove image"><${ X } size=${ 14 } /></button>
      </div>`
    : html`
      <button
        type="button"
        className="dropzone"
        onClick=${ () => fileRef.current?.click() }
        onDragOver=${ ( event ) => event.preventDefault() }
        onDrop=${ ( event ) => {
          event.preventDefault()
          event.stopPropagation()
          upload( event.dataTransfer.files?.[ 0 ] )
        } }
      >
        <${ ImageSquare } size=${ 22 } />
        <span>Drop image or click to upload</span>
      </button>`

  const form = html`
    <div className="project-form">
      <${ Field } label="Title">
        <input value=${ project.title } maxLength=${ 80 } onChange=${ ( event ) => onChange( { title: event.target.value } ) } />
      <//>
      <${ Field } label="Tagline">
        <input value=${ project.tagline } maxLength=${ 140 } placeholder="One line on what it is" onChange=${ ( event ) => onChange( { tagline: event.target.value } ) } />
      <//>
      <div className="field-pair">
        <${ Field } label="Year">
          <input value=${ project.year } maxLength=${ 12 } placeholder="2026" onChange=${ ( event ) => onChange( { year: event.target.value } ) } />
        <//>
        <${ Field } label="Link">
          <input value=${ project.link } type="url" placeholder="https://" onChange=${ ( event ) => onChange( { link: event.target.value } ) } />
        <//>
      </div>
      <${ Field } label="Description">
        <textarea rows=${ 4 } value=${ project.description } maxLength=${ 2000 } placeholder="Role, problem, outcome. Blank line = new paragraph." onChange=${ ( event ) => onChange( { description: event.target.value } ) } />
      <//>

      <div className="field">
        <span className="field-label">Colour</span>
        <div className="swatch-row">
          ${ PROJECT_COLORS.map( ( color ) => html`
            <button key=${ color } type="button" className="color-dot" style=${ { background: color } } aria-label=${ `Colour ${ color }` } aria-pressed=${ project.color === color } onClick=${ () => onChange( { color } ) } />` ) }
          <input type="color" className="color-input" value=${ project.color } onChange=${ ( event ) => onChange( { color: event.target.value } ) } aria-label="Custom colour" />
        </div>
      </div>

      <div className="field">
        <span className="field-label">Image</span>
        ${ imageSlot }
        <input ref=${ fileRef } type="file" accept="image/*" hidden onChange=${ ( event ) => upload( event.target.files?.[ 0 ] ) } />
        ${ error && html`<p className="field-error">${ error }</p>` }
      </div>

      <button type="button" className="danger-link" onClick=${ onRemove }><${ Trash } size=${ 14 } /> Remove project</button>
    </div>`

  return html`
    <li ref=${ cardRef } className="project-card" data-open=${ open } style=${ { '--project-color': project.color } } ...${ dragProps }>
      <div className="project-row">
        <span className="drag-handle" aria-hidden="true"><${ DotsSixVertical } size=${ 16 } /></span>
        <button type="button" className="project-summary" onClick=${ onToggle } aria-expanded=${ open }>
          <span className="project-swatch" />
          <span className="project-summary-text">
            <span className="project-summary-title">${ project.title || 'Untitled' }</span>
            <span className="project-summary-sub">${ project.tagline || 'No tagline yet' }</span>
          </span>
        </button>
        <div className="project-row-actions">
          <button type="button" className="mini-button" onClick=${ () => onMove( -1 ) } disabled=${ index === 0 } aria-label="Move up"><${ ArrowUp } size=${ 14 } /></button>
          <button type="button" className="mini-button" onClick=${ () => onMove( 1 ) } disabled=${ index === count - 1 } aria-label="Move down"><${ ArrowDown } size=${ 14 } /></button>
        </div>
      </div>
      ${ open && form }
    </li>`
}

export function ProjectEditor( { projects, maxProjects, openId, onOpen, imageUrls, onAdd, onUpdate, onMove, onReorder, onRemove, onImage } ) {
  const [ dragId, setDragId ] = useState( null )
  const full = projects.length >= maxProjects

  const cards = projects.map( ( project, index ) => html`
    <${ ProjectCard }
      key=${ project.id }
      project=${ project }
      index=${ index }
      count=${ projects.length }
      open=${ openId === project.id }
      imageUrl=${ project.image ? imageUrls[ project.image ] : null }
      onToggle=${ () => onOpen( openId === project.id ? null : project.id ) }
      onChange=${ ( patch ) => onUpdate( project.id, patch ) }
      onMove=${ ( direction ) => onMove( project.id, direction ) }
      onRemove=${ () => onRemove( project.id ) }
      onImage=${ ( name, blob ) => onImage( project.id, name, blob ) }
      dragProps=${ {
        draggable: true,
        'data-dragging': dragId === project.id,
        onDragStart: ( event ) => {
          setDragId( project.id )
          event.dataTransfer.effectAllowed = 'move'
        },
        onDragEnd: () => setDragId( null ),
        onDragOver: ( event ) => {
          if ( !dragId || dragId === project.id ) return
          event.preventDefault()
          onReorder( dragId, project.id )
        },
      } }
    />` )

  // Builder > Projects > Add: new card, opened
  return html`
    <section className="panel-section">
      <div className="panel-head">
        <h2>Projects <span className="count">${ projects.length } / ${ maxProjects }</span></h2>
        <button type="button" className="ghost-button" onClick=${ onAdd } disabled=${ full } title=${ full ? 'Scene is full. Pick a bigger scene or remove one.' : undefined }>
          <${ Plus } size=${ 14 } /> Add
        </button>
      </div>
      <p className="panel-hint">Each project becomes one piece in the scene, in this order.</p>
      <ol className="project-list">${ cards }</ol>
    </section>`
}
