// Renders styling editor panel for identity, scene picker, palette, and fonts.

import { Fragment } from 'react'
import { html } from './html.js'
import { Plus, X } from './builder-icons.js'
import { PRESET_IDS, PRESET_INFO } from './preset-info.js'
import { FONT_PAIRS, PALETTES } from './site-schema.js'

const MARBLE_DOTS = [ [ 30, 16 ], [ 36, 12 ], [ 36, 20 ], [ 24, 12 ], [ 24, 20 ], [ 30, 8 ], [ 30, 24 ] ]
const POOL_DOTS = [ [ 26, 16 ], [ 32, 12 ], [ 32, 20 ], [ 38, 8 ], [ 38, 16 ], [ 38, 24 ] ]

// Builder > Style > Scene card glyph: tiny drawing of each break
const SceneGlyph = ( { preset } ) => {
  if ( preset === 'dominoes' ) {
    return html`
      <svg viewBox="0 0 48 32" aria-hidden="true">
        ${ [ 0, 1, 2, 3, 4 ].map( ( index ) => html`<rect key=${ index } x=${ 6 + index * 8 } y=${ 8 + Math.sin( index ) * 3 } width="4" height="14" rx="1" transform=${ `rotate(${ index < 2 ? 32 : 0 } ${ 8 + index * 8 } 22)` } />` ) }
      </svg>`
  }
  const marbles = preset === 'marbles'
  return html`
    <svg viewBox="0 0 48 32" aria-hidden="true">
      <circle cx="8" cy="16" r=${ marbles ? 5 : 3.6 } />
      ${ ( marbles ? MARBLE_DOTS : POOL_DOTS ).map( ( [ x, y ] ) => html`<circle key=${ `${ x }-${ y }` } cx=${ x } cy=${ y } r=${ marbles ? 3 : 3.6 } />` ) }
    </svg>`
}

export function StyleEditor( { site, onChange } ) {
  const setContacts = ( contacts ) => onChange( { contacts } )

  // Builder > Style > Scene card: swap break, re-bakes preview
  const sceneCards = PRESET_IDS.map( ( id ) => {
    const info = PRESET_INFO[ id ]
    const tooMany = site.projects.length > info.maxProjects
    return html`
      <button
        key=${ id }
        type="button"
        role="radio"
        aria-checked=${ site.preset === id }
        className="scene-card"
        disabled=${ tooMany }
        title=${ tooMany ? `Fits ${ info.maxProjects } projects` : undefined }
        onClick=${ () => onChange( { preset: id } ) }
      >
        <${ SceneGlyph } preset=${ id } />
        <span className="scene-card-label">${ info.label }</span>
        <span className="scene-card-blurb">${ info.blurb }</span>
        <span className="scene-card-max">Up to ${ info.maxProjects }</span>
      </button>`
  } )

  // Builder > Style > Palette card
  const paletteCards = Object.entries( PALETTES ).map( ( [ id, palette ] ) => html`
    <button key=${ id } type="button" role="radio" aria-checked=${ site.palette === id } className="palette-card" onClick=${ () => onChange( { palette: id } ) }>
      <span className="palette-chip" style=${ { background: palette.bg } }>
        <span style=${ { background: palette.surface } } />
        <span style=${ { background: palette.accent } } />
      </span>
      ${ palette.label }
    </button>` )

  // Builder > Style > Type card
  const typeCards = Object.entries( FONT_PAIRS ).map( ( [ id, pair ] ) => html`
    <button key=${ id } type="button" role="radio" aria-checked=${ site.fontPair === id } className="type-card" onClick=${ () => onChange( { fontPair: id } ) }>
      <span className="type-sample" style=${ { fontFamily: pair.display } }>Aa</span>
      ${ pair.label }
    </button>` )

  // Builder > Style > Contact row: label + url, remove
  const contactRows = site.contacts.map( ( contact, index ) => html`
    <li key=${ index } className="contact-row">
      <input aria-label="Label" placeholder="Instagram" value=${ contact.label } onChange=${ ( event ) => setContacts( site.contacts.map( ( item, itemIndex ) => itemIndex === index ? { ...item, label: event.target.value } : item ) ) } />
      <input aria-label="URL" placeholder="https:// or mailto:" value=${ contact.url } onChange=${ ( event ) => setContacts( site.contacts.map( ( item, itemIndex ) => itemIndex === index ? { ...item, url: event.target.value } : item ) ) } />
      <button type="button" className="mini-button" aria-label="Remove contact" onClick=${ () => setContacts( site.contacts.filter( ( _, itemIndex ) => itemIndex !== index ) ) }><${ X } size=${ 12 } /></button>
    </li>` )

  return html`
    <${ Fragment }>
      <section className="panel-section">
        <div className="panel-head"><h2>Identity</h2></div>
        <label className="field">
          <span className="field-label">Name</span>
          <input value=${ site.name } maxLength=${ 80 } onChange=${ ( event ) => onChange( { name: event.target.value } ) } />
        </label>
        <label className="field">
          <span className="field-label">Headline</span>
          <input value=${ site.headline } maxLength=${ 140 } onChange=${ ( event ) => onChange( { headline: event.target.value } ) } />
        </label>
        <label className="field">
          <span className="field-label">Intro</span>
          <textarea rows=${ 3 } value=${ site.intro } maxLength=${ 400 } onChange=${ ( event ) => onChange( { intro: event.target.value } ) } />
        </label>
      </section>

      <section className="panel-section">
        <div className="panel-head"><h2>Scene</h2></div>
        <div className="scene-grid" role="radiogroup" aria-label="Scene">${ sceneCards }</div>
      </section>

      <section className="panel-section">
        <div className="panel-head"><h2>Palette</h2></div>
        <div className="palette-grid" role="radiogroup" aria-label="Palette">${ paletteCards }</div>
      </section>

      <section className="panel-section">
        <div className="panel-head"><h2>Type</h2></div>
        <div className="type-grid" role="radiogroup" aria-label="Type pair">${ typeCards }</div>
      </section>

      <section className="panel-section">
        <div className="panel-head">
          <h2>Contact</h2>
          <button type="button" className="ghost-button" disabled=${ site.contacts.length >= 8 } onClick=${ () => setContacts( [ ...site.contacts, { label: '', url: '' } ] ) }>
            <${ Plus } size=${ 14 } /> Add
          </button>
        </div>
        <ul className="contact-list">${ contactRows }</ul>
        <p className="panel-hint">Only https:// and mailto: links are published.</p>
      </section>
    <//>`
}
