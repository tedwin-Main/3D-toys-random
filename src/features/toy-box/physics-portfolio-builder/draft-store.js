/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/draft-store.js
 * PURPOSE: builder draft persistence: site JSON in localStorage, baked breaks + images in IndexedDB
 * UI: Builder (autosave), Viewer ?draft=1 (live preview of unsaved draft)
 * USED BY: builder-page.js, site-loader.js, export-site.js
 * KEY EXPORTS: loadDraftSite, saveDraftSite, saveDraftRecordings, loadDraftRecordings, saveImage, loadImage, deleteImage
 */

import { del, get, set } from 'idb-keyval'

const SITE_KEY = 'ppb:draft-site'
const RECORDINGS_KEY = 'ppb:draft-recordings'
const imageKey = ( name ) => `ppb:image:${ name }`

// storage can throw (private mode, blocked site data): builder still works, just forgets on reload
export const loadDraftSite = () => {
  try {
    const raw = localStorage.getItem( SITE_KEY )
    return raw ? JSON.parse( raw ) : null
  } catch {
    return null
  }
}

export const saveDraftSite = ( site ) => {
  try {
    localStorage.setItem( SITE_KEY, JSON.stringify( site ) )
  } catch {
    // quota or blocked storage: nothing to do
  }
}

const guard = async ( action, fallback = null ) => {
  try {
    return await action()
  } catch {
    return fallback
  }
}

export const saveDraftRecordings = ( encoded ) => guard( () => set( RECORDINGS_KEY, encoded ) )
export const loadDraftRecordings = () => guard( () => get( RECORDINGS_KEY ), null )
export const saveImage = ( name, blob ) => guard( () => set( imageKey( name ), blob ) )
export const loadImage = ( name ) => guard( () => get( imageKey( name ) ), null )
export const deleteImage = ( name ) => guard( () => del( imageKey( name ) ) )
