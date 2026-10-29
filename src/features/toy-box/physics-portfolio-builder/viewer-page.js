/**
 * FILE: 3d-toys/physics-portfolio-builder/frontend/pages/viewer-page.js
 * PURPOSE: published portfolio: scroll-scrubbed break hero, settled scene as nav, work list, contact, project drawer
 * UI: Viewer (whole page)
 * USED BY: viewer-main.js
 * KEY EXPORTS: ViewerPage
 */

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { html } from './html.js'
import { BreakStage } from './break-stage.js'
import { ProjectDrawer } from './project-drawer.js'
import { ProjectGrid } from './project-grid.js'
import { applyTheme } from './theme-tokens.js'

gsap.registerPlugin( ScrollTrigger )

const clamp = ( value ) => Math.min( 1, Math.max( 0, value ) )
const REDUCED_MOTION = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
const IS_TOUCH = window.matchMedia( '(hover: none) and (pointer: coarse)' ).matches

export function ViewerPage( { site, recording, imageUrl, draft } ) {
  const heroRef = useRef( null )
  const stageRef = useRef( null )
  const copyRef = useRef( null )
  const pickRef = useRef( null )
  const lenisRef = useRef( null )
  const [ selected, setSelected ] = useState( -1 )

  useLayoutEffect( () => {
    applyTheme( document.documentElement, site )
    document.title = `${ site.name } — ${ site.headline }`
  }, [ site ] )

  // Viewer > page: Lenis weighted scroll feeds ScrollTrigger; reduced motion keeps native scroll
  useEffect( () => {
    if ( REDUCED_MOTION ) return undefined
    const lenis = new Lenis( { lerp: 0.1, anchors: true } )
    lenisRef.current = lenis
    lenis.on( 'scroll', ScrollTrigger.update )
    const tick = ( time ) => lenis.raf( time * 1000 )
    gsap.ticker.add( tick )
    gsap.ticker.lagSmoothing( 0 )
    return () => {
      gsap.ticker.remove( tick )
      lenis.destroy()
      lenisRef.current = null
    }
  }, [] )

  // Viewer > Hero: scroll through tall section plays break; copy clears, pick hint lands once settled
  useLayoutEffect( () => {
    const paint = ( progress ) => {
      stageRef.current?.setProgress( progress )
      const copyFade = clamp( progress / 0.12 )
      gsap.set( copyRef.current, { autoAlpha: 1 - copyFade, y: -40 * copyFade } )
      gsap.set( pickRef.current, { autoAlpha: clamp( ( progress - 0.8 ) / 0.06 ) } )
    }
    if ( REDUCED_MOTION ) {
      paint( 1 )
      return undefined
    }
    const playhead = { progress: 0 }
    const tween = gsap.to( playhead, {
      progress: 1,
      ease: 'none',
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom bottom', scrub: IS_TOUCH ? 0.25 : 0.6 },
      onUpdate: () => paint( playhead.progress ),
    } )
    paint( 0 )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [ recording ] )

  // Viewer > Drawer open: page scroll holds still underneath
  useEffect( () => {
    if ( selected >= 0 ) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [ selected ] )

  const close = useCallback( () => setSelected( -1 ), [] )
  const step = useCallback( ( direction ) => {
    setSelected( ( current ) => ( current + direction + site.projects.length ) % site.projects.length )
  }, [ site.projects.length ] )

  // Viewer > Footer > Contact links
  const contactLinks = site.contacts.map( ( contact ) => html`
    <li key=${ contact.url }><a href=${ contact.url } target=${ contact.url.startsWith( 'mailto:' ) ? undefined : '_blank' } rel="noreferrer noopener">${ contact.label }</a></li>` )

  return html`
    <${ Fragment }>
      ${ draft && html`<p className="draft-ribbon">Draft preview</p>` }
      <header className="site-bar">
        <a href="#top" className="site-name">${ site.name }</a>
        <nav aria-label="Sections">
          <a href="#work">Work</a>
          ${ site.contacts.length > 0 && html`<a href="#contact">Contact</a>` }
        </nav>
      </header>

      <main id="top">
        <section ref=${ heroRef } className=${ `hero hero-${ site.preset }` } data-reduced=${ REDUCED_MOTION } aria-label="Intro: scroll to break the scene, then pick a project">
          <div className="hero-sticky">
            <${ BreakStage } ref=${ stageRef } recording=${ recording } site=${ site } onSelect=${ setSelected } />
            <div ref=${ copyRef } className="hero-copy">
              <h1 className="hero-title">${ site.headline }</h1>
              <p className="hero-intro">${ site.intro }</p>
              <p className="hero-hint"><span className="hero-hint-line" aria-hidden="true" />${ IS_TOUCH ? 'Swipe to break' : 'Scroll to break' }</p>
            </div>
            <p ref=${ pickRef } className="hero-pick">${ IS_TOUCH ? 'Tap a piece to open a project' : 'Pick a piece to open a project' }</p>
          </div>
        </section>

        <section id="work" className="work" aria-labelledby="work-title">
          <div className="section-head">
            <h2 id="work-title">Selected work</h2>
            <p>${ site.projects.length } project${ site.projects.length === 1 ? '' : 's' }</p>
          </div>
          <${ ProjectGrid } projects=${ site.projects } imageUrl=${ imageUrl } onOpen=${ setSelected } />
        </section>
      </main>

      <footer id="contact" className="site-footer">
        <p className="footer-lead">${ site.name }</p>
        <ul className="footer-links">${ contactLinks }</ul>
        <p className="footer-credit">Built with Break Builder</p>
      </footer>

      <${ ProjectDrawer }
        project=${ site.projects[ selected ] || null }
        index=${ selected }
        total=${ site.projects.length }
        imageUrl=${ imageUrl }
        onClose=${ close }
        onStep=${ step }
      />
    <//>`
}
