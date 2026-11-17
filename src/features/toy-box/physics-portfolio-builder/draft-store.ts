// Manages builder draft persistence in localStorage and IndexedDB.

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
