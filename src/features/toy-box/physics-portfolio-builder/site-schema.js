/**
 * FILE: src/features/toy-box/physics-portfolio-builder/site-schema.js
 * PURPOSE: site.json shape: palettes, font pairs, default draft, normalize untrusted input
 * UI: Builder > Projects + Style panels, Viewer (theme tokens)
 * USED BY: builder-page.js, viewer-page.js, site-bundle.js, tests
 * KEY EXPORTS: PALETTES, FONT_PAIRS, PROJECT_COLORS, createDefaultSite, createProject, normalizeSite, slugify
 */

import { PRESET_INFO } from './preset-info.js'

export const SITE_VERSION = 1

export const PALETTES = Object.freeze( {
  felt: Object.freeze( { label: 'Felt night', bg: '#07110d', fg: '#f2f1e9', muted: '#9fb0a6', line: 'rgba(242,241,233,0.14)', surface: '#0e5a3a', rail: '#2a1a10', accent: '#e8c25a' } ),
  chalk: Object.freeze( { label: 'Chalk day', bg: '#f2f1e9', fg: '#0a0c0b', muted: '#5f645f', line: 'rgba(10,12,11,0.14)', surface: '#d8d2c2', rail: '#8a6a4a', accent: '#c4442b' } ),
  ink: Object.freeze( { label: 'Ink', bg: '#0b0b10', fg: '#eceaf4', muted: '#8d8aa0', line: 'rgba(236,234,244,0.12)', surface: '#1b1b26', rail: '#2e2e3e', accent: '#8b7bff' } ),
  clay: Object.freeze( { label: 'Clay', bg: '#efe4d6', fg: '#2a1d14', muted: '#7a6656', line: 'rgba(42,29,20,0.14)', surface: '#c98a5e', rail: '#5a3826', accent: '#1f4f8a' } ),
} )

export const FONT_PAIRS = Object.freeze( {
  grotesk: Object.freeze( { label: 'Grotesk', display: '"Space Grotesk", sans-serif', body: '"Inter", sans-serif' } ),
  editorial: Object.freeze( { label: 'Editorial', display: '"Fraunces", serif', body: '"Inter", sans-serif' } ),
  mono: Object.freeze( { label: 'Mono', display: '"JetBrains Mono", monospace', body: '"JetBrains Mono", monospace' } ),
} )

// pool ball colours (8Ball rack), reused as default project accents
export const PROJECT_COLORS = Object.freeze( [
  '#f5b818', '#1b46a2', '#cb242a', '#59287a', '#e76317', '#126d40', '#7a1d33',
  '#2b8fbd', '#d9577f', '#6f8f2e', '#b8862b', '#3d3d9e',
] )

const text = ( value, max, fallback = '' ) => ( typeof value === 'string' ? value : fallback ).slice( 0, max )
const isColor = ( value ) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test( value )
// only http(s) and mailto links survive: site is public, javascript: urls would run on click
const safeUrl = ( value ) => {
  if ( typeof value !== 'string' || !value.trim() ) return ''
  const trimmed = value.trim()
  return /^(https?:\/\/|mailto:)/i.test( trimmed ) ? trimmed.slice( 0, 500 ) : ''
}

let idCounter = 0
const makeId = () => `p${ Date.now().toString( 36 ) }${ ( idCounter++ ).toString( 36 ) }`

export const createProject = ( index = 0, overrides = {} ) => ( {
  id: makeId(),
  title: `Project ${ index + 1 }`,
  tagline: '',
  description: '',
  year: '',
  link: '',
  image: null,
  color: PROJECT_COLORS[ index % PROJECT_COLORS.length ],
  ...overrides,
} )

export const createDefaultSite = () => ( {
  version: SITE_VERSION,
  name: 'Your Name',
  headline: 'Selected work, broken open.',
  intro: 'Designer and developer. Scroll to break the rack, then pick a ball.',
  preset: 'pool',
  palette: 'felt',
  fontPair: 'grotesk',
  seed: 8,
  projects: [
    createProject( 0, { title: 'Northwind', tagline: 'Brand system for a sailing co-op', year: '2026' } ),
    createProject( 1, { title: 'Halftone', tagline: 'Print studio e-commerce', year: '2025' } ),
    createProject( 2, { title: 'Orbit', tagline: 'Realtime dashboard for a satellite startup', year: '2025' } ),
    createProject( 3, { title: 'Field Notes', tagline: 'Editorial site for a nature magazine', year: '2024' } ),
    createProject( 4, { title: 'Tempo', tagline: 'Habit tracker iOS app', year: '2024' } ),
  ],
  contacts: [
    { label: 'Email', url: 'mailto:hello@example.com' },
  ],
} )

// Cloud Sync: clamp any site.json (builder draft or imported file) to known shape
export function normalizeSite( input ) {
  const fallback = createDefaultSite()
  const site = input && typeof input === 'object' ? input : {}
  const preset = PRESET_INFO[ site.preset ] ? site.preset : fallback.preset
  const projects = Array.isArray( site.projects ) ? site.projects : fallback.projects
  return {
    version: SITE_VERSION,
    name: text( site.name, 80, fallback.name ),
    headline: text( site.headline, 140, fallback.headline ),
    intro: text( site.intro, 400, fallback.intro ),
    preset,
    palette: PALETTES[ site.palette ] ? site.palette : fallback.palette,
    fontPair: FONT_PAIRS[ site.fontPair ] ? site.fontPair : fallback.fontPair,
    seed: Number.isInteger( site.seed ) && site.seed > 0 ? site.seed : fallback.seed,
    projects: projects.slice( 0, PRESET_INFO[ preset ].maxProjects ).map( ( project, index ) => ( {
      id: text( project?.id, 40 ) || makeId(),
      title: text( project?.title, 80, `Project ${ index + 1 }` ),
      tagline: text( project?.tagline, 140 ),
      description: text( project?.description, 2000 ),
      year: text( project?.year, 12 ),
      link: safeUrl( project?.link ),
      image: typeof project?.image === 'string' && /^[a-z0-9-]{1,64}\.(webp|png|jpg|jpeg)$/i.test( project.image ) ? project.image : null,
      color: isColor( project?.color ) ? project.color : PROJECT_COLORS[ index % PROJECT_COLORS.length ],
    } ) ),
    contacts: ( Array.isArray( site.contacts ) ? site.contacts : [] ).slice( 0, 8 )
      .map( ( contact ) => ( { label: text( contact?.label, 40 ), url: safeUrl( contact?.url ) } ) )
      .filter( ( contact ) => contact.label && contact.url ),
  }
}

// Builder > Export zip: zip + folder name from site name (lowercase, a-z0-9-, max 52 chars)
export const slugify = ( value ) => ( String( value || '' )
  .toLowerCase()
  .normalize( 'NFKD' )
  .replace( /[^a-z0-9]+/g, '-' )
  .replace( /^-+|-+$/g, '' )
  .slice( 0, 52 ) || 'portfolio' )
