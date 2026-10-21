/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/components/top-bar.js
 * PURPOSE: builder header: brand, open full preview, export zip, result toast
 * UI: Builder > Top bar
 * USED BY: builder-page.js
 * KEY EXPORTS: TopBar
 */

import { useState } from 'react'
import { html } from './html.js'
import { ArrowSquareOut, DownloadSimple } from './builder-icons.js'
import { downloadSiteZip } from './export-site.js'

export function TopBar( { site, recordings, onBeforePreview } ) {
  const [ busy, setBusy ] = useState( false )
  const [ notice, setNotice ] = useState( null )

  // Builder > Top bar > Export zip: static site download
  const exportZip = async () => {
    setBusy( true )
    setNotice( null )
    try {
      const count = await downloadSiteZip( { site, recordings } )
      setNotice( { tone: 'ok', text: `Zip saved (${ count } files). Unzip and host anywhere static.` } )
    } catch ( error ) {
      setNotice( { tone: 'error', text: error.message } )
    } finally {
      setBusy( false )
    }
  }

  const ready = recordings.length > 0 && !busy

  // Builder > Top bar > Preview site: full viewer on draft, new tab
  return html`
    <header className="top-bar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span>Break Builder</span>
      </div>
      <div className="top-actions">
        <a className="ghost-button" href="./viewer.html?draft=1" target="_blank" rel="noreferrer" onClick=${ onBeforePreview }>
          <${ ArrowSquareOut } size=${ 15 } /> Preview site
        </a>
        <button type="button" className="primary-button" disabled=${ !ready } onClick=${ exportZip }>
          <${ DownloadSimple } size=${ 15 } /> ${ busy ? 'Packing…' : 'Export zip' }
        </button>
      </div>
      ${ notice && html`
        <div className="toast" data-tone=${ notice.tone } role="status">
          <span>${ notice.text }</span>
          <button type="button" className="mini-button" onClick=${ () => setNotice( null ) } aria-label="Dismiss">×</button>
        </div>` }
    </header>`
}
