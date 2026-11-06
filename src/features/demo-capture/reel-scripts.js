// Lists the 59 aero reels in posting order with hook text, caption line and hashtags.

const BASE_TAGS = ['#frutigeraero', '#nostalgia'];
const STYLE_TAGS = {
  core: '#aeroaesthetic', eco: '#ecoaero', dark: '#darkaero', aquatic: '#aquaticaero', humanity: '#humanityaero',
  technozen: '#technozen', space: '#spaceaero', metro: '#frutigermetro', console: '#2000sgaming', y2k: '#y2kaesthetic',
  mcbling: '#mcbling', vectorheart: '#web20', skeuo: '#skeuomorphism', retro: '#90skid',
};
const QUESTIONS = [
  'Who else remembers this?', 'Rate the nostalgia 1 to 10', 'What year does this take you back to?',
  'Tag someone who needs to see this', 'Did you have this? Yes or no', 'Which era was yours?',
];

// Posting order: strongest openers first, styles interleaved so the feed stays varied
export const REEL_SCRIPTS = [
  { name: 'dial-up-connect', hook: "POV: it's 1999 and you're getting online", line: 'A working dial-up dialer: dial tone, DTMF beeps and the full handshake screech, all synthesized live in the browser.', tags: ['#dialup', '#90sinternet'] },
  { name: 'aero-glass-desktop', hook: 'Your 2007 desktop just woke up', line: 'Frosted glass windows, glowing captions and a tray balloon chime, rebuilt live with zero images.', tags: ['#glassui', '#2000stech'] },
  { name: 'dolphin-lagoon', hook: 'This stock image lived on every PC', line: 'The turquoise dolphin lagoon wallpaper, brought to life as a live 3D scene.', tags: ['#dolphins', '#y2kwallpaper'] },
  { name: 'boot-sequence', hook: 'The sound every 1998 morning started with', line: 'CRT warm-up, BIOS memory count, PC speaker beep and the boot screen, one full power cycle.', tags: ['#retrocomputing', '#crt'] },
  { name: 'channel-menu', hook: 'Turning on the console after school', line: 'Rounded white channel tiles, each one running its own little live animation.', tags: ['#consolemenu', '#gamingnostalgia'] },
  { name: 'iridescent-cd-burner', hook: 'Burning a mix CD for your crush', line: 'A blank disc spins and throws rainbow light while the burn bar fills up.', tags: ['#mixcd', '#2000smusic'] },
  { name: 'bubble-meadow', hook: 'The wallpaper that defined 2008', line: 'Green hills, a mirror lake and 40,000 blades of grass swaying in the wind, live in 3D.', tags: ['#wallpaper', '#3dart'] },
  { name: 'mcbling-page', hook: 'Your 2005 page had THIS much sparkle', line: 'Pink camo, flickering glitter text and rhinestone boxes at full McBling.', tags: ['#glitter', '#2000saesthetic'] },
  { name: 'virtual-pet-egg', hook: "Don't let it die this time", line: 'A see-through keychain pet on a dot-matrix screen. Feed it, play with it, clean up after it.', tags: ['#virtualpet', '#90stoys'] },
  { name: 'metro-live-tiles', hook: 'The year glass went flat', line: 'A sideways wall of live tiles that peek, flip and slide in thin light type.', tags: ['#metroui', '#flatdesign'] },
  { name: 'click-wheel-player', hook: 'Scrolling to your song in 2005', line: 'A glossy white pocket player with a working click wheel and sliding menus.', tags: ['#mp3player', '#2000smusic'] },
  { name: 'underwater-reef', hook: 'Aquatic Aero at max saturation', line: 'A sunlit coral reef with dancing caustics and shafts of light, live in 3D.', tags: ['#underwater', '#oceanaesthetic'] },
  { name: 'y2k-countdown', hook: '10 seconds before the year 2000', line: 'Glowing seven-segment digits count down the millennium at a Y2K readiness centre.', tags: ['#y2k', '#newyears'] },
  { name: 'dvd-menu-2004', hook: 'The DVD menu you let loop forever', line: 'Sunlit water, lens streaks, film grain and a glossy title menu for a summer film that never existed.', tags: ['#dvdmenu', '#2000smovies'] },
  { name: 'skeuo-notes-shelf', hook: 'When apps were made of leather and wood', line: 'A stitched leather notepad beside a wooden bookshelf. Peak 2010 skeuomorphism.', tags: ['#skeuomorphic', '#appdesign'] },
  { name: 'glossy-messenger', hook: 'Your crush just came online', line: 'A glossy buddy list with status gems, nudges and now-playing messages.', tags: ['#instantmessenger', '#2000skid'] },
  { name: 'solitaire-win-cascade', hook: 'The win screen we all lived for', line: 'Klondike on green felt, ending in the cascade everyone waited for.', tags: ['#solitaire', '#90scomputer'] },
  { name: 'aurora-login-screen', hook: 'Click your name to log in, 2007', line: 'Aurora ribbons and light streaks behind glossy user tiles on a deep teal sky.', tags: ['#loginscreen', '#aurora'] },
  { name: 'flip-phone-ui', hook: 'Texting on a flip phone in 2006', line: 'Signal bars, a bubbly wallpaper and a 3x3 grid of glossy menu icons.', tags: ['#flipphone', '#2000sphone'] },
  { name: 'technozen-spa', hook: 'The calmest corner of the 2000s', line: 'A misty pool, balancing pebbles and swaying bamboo. Technozen at its softest.', tags: ['#zen', '#spaaesthetic'] },
  { name: 'web2-beta-landing', hook: 'Every 2006 startup looked like this', line: 'Glossy header, reflected logo and an orange BETA badge for a made-up social site.', tags: ['#startup', '#webdesign'] },
  { name: 'maze-screensaver', hook: 'Left your PC idle in 1998?', line: 'The first-person brick maze screensaver, carved fresh every run.', tags: ['#screensaver', '#retrogaming'] },
  { name: 'media-bar-xmb', hook: 'That smooth console menu scroll', line: 'A row of line-art categories crossed by a column of items, floating on a soft wave.', tags: ['#consolemenu', '#gamingnostalgia'] },
  { name: 'eco-glass-globe', hook: 'Every 2008 corporate slide had this', line: 'A procedural planet inside a refracting glass orb on a chrome stand.', tags: ['#glassorb', '#stockimage'] },
  { name: 'throwback-profile-desktop', hook: 'A 2007 afternoon on one screen', line: 'Glitter profile name, a blinking Online Now! and a messenger window popping up.', tags: ['#2000sinternet', '#profilepage'] },
  { name: 'glossy-space', hook: 'Space Aero wallpaper, but alive', line: 'A glossy blue-green planet with a sun glint, drifting clouds and city lights at night.', tags: ['#space', '#planet'] },
  { name: 'desk-helper-assistant', hook: "The helper that wouldn't leave you alone", line: 'Orbit the satellite robot floats over your 1998 document, eager to help.', tags: ['#90soffice', '#retrotech'] },
  { name: 'cover-carousel', hook: 'Flipping through albums in 2006', line: '24 hand-painted album covers sliding past in 3D.', tags: ['#albumart', '#musicnostalgia'] },
  { name: 'portal-homepage-1999', hook: 'The 1999 homepage was a LOT', line: 'Tiled stars, a spinning wireframe globe, rotating banner ads and a scrolling marquee.', tags: ['#90sweb', '#oldinternet'] },
  { name: 'dark-aero-night', hook: 'Frutiger Aero, after dark', line: 'An aurora sky full of stars over a still lake that reflects everything.', tags: ['#darkaesthetic', '#aurora'] },
  { name: 'e-card-greeting', hook: 'Someone sent you an e-card in 2000', line: 'The sealed envelope opens, the card slides out and unfolds with a little tune.', tags: ['#ecard', '#oldinternet'] },
  { name: 'gel-button-maker', hook: 'Every 2006 design blog linked this', line: 'A glossy gel button generator: pick the hue, shape, gloss and reflection.', tags: ['#webdesign', '#glossybuttons'] },
  { name: 'airport-kiosk', hook: 'Checking in for a flight in 2008', line: 'A bright glossy touch kiosk while planes taxi past the tall sunny windows.', tags: ['#airport', '#travelnostalgia'] },
  { name: 'wordart-studio', hook: 'Every school newsletter title ever', line: 'Twelve fancy text styles: rainbow arch, chrome 3D, waving blue and more.', tags: ['#wordart', '#schoolmemories'] },
  { name: 'aquarium-icon-dock', hook: 'App icons in a living aquarium', line: 'Glossy 3D icons on a glass shelf while fish school through rising bubbles.', tags: ['#aquarium', '#icons'] },
  { name: 'media-center-menu', hook: 'Couch, remote, 2005 media centre', line: 'Deep blue waves, a green orb and a menu that rolls like a wheel.', tags: ['#mediacenter', '#tvnostalgia'] },
  { name: 'skinnable-mp3-player', hook: 'Your first skinnable MP3 player', line: 'Seven-segment time, scrolling song title, ten-band EQ and a docked playlist.', tags: ['#mp3', '#90smusic'] },
  { name: 'luna-desktop', hook: 'That green hill. That blue sky. 2001.', line: 'A glossy blue taskbar, a fat green start button and the hill wallpaper.', tags: ['#2001', '#desktop'] },
  { name: 'frutiger-eco-site', hook: 'Green energy websites in 2008', line: 'Rolling hills, spinning wind turbines and a sun over the lake, all live.', tags: ['#greenenergy', '#webdesign'] },
  { name: 'pda-today-screen', hook: 'Tapping a stylus in 2003', line: 'A pocket PC Today screen with handwriting ink over a painted lake.', tags: ['#pda', '#retrotech'] },
  { name: 'flash-intro-2002', hook: 'Click to enter. Skip intro?', line: 'A pixel preloader counts to 100%, then chrome swooshes take over the splash page.', tags: ['#flashintro', '#oldweb'] },
  { name: 'plaza-avatars', hook: 'Hanging out in the avatar plaza', line: 'A crowd of chibi characters with big round heads wandering a bright plaza.', tags: ['#avatar', '#gamingnostalgia'] },
  { name: 'defrag-visualizer', hook: 'The most satisfying thing in 1998', line: 'Watch the cluster map get defragmented block by block.', tags: ['#defrag', '#oddlysatisfying'] },
  { name: 'blade-dashboard', hook: 'Flipping through the 2005 console blades', line: 'Five coloured blades stacked like pages in 3D.', tags: ['#consolemenu', '#2000sgaming'] },
  { name: 'soap-bubbles-screensaver', hook: 'This screensaver lived on every office PC', line: 'Glassy soap bubbles drift, bounce and refract the desktop behind them.', tags: ['#bubbles', '#screensaver'] },
  { name: 'y2k-chrome-landing', hook: 'Tech optimism on the eve of 2000', line: 'A liquid chrome blob logo rippling under studio light strips.', tags: ['#chrome', '#y2kdesign'] },
  { name: 'photo-gallery-viewer', hook: 'Browsing your 2007 photo library', line: 'A glass window, a glossy toolbar, a tag tree and a thumbnail grid.', tags: ['#photogallery', '#2000stech'] },
  { name: 'humanity-corporate-site', hook: 'Smiling stock people, 2008 edition', line: 'A corporate brochure site full of procedurally drawn smiling people.', tags: ['#stockphoto', '#corporate'] },
  { name: 'multimedia-encyclopedia', hook: 'Homework in 1995 meant this CD-ROM', line: 'A spinning globe, chunky toolbar buttons and an A to Z index.', tags: ['#cdrom', '#90sschool'] },
  { name: 'glass-ribbons-screensaver', hook: 'The screensaver that hypnotized us', line: 'Translucent glass ribbons looping through dark blue space.', tags: ['#screensaver', '#hypnotic'] },
  { name: 'memory-card-manager', hook: 'Is there enough space on your memory card?', line: 'Two 15-block cards and spinning 3D save icons over slow blue light.', tags: ['#memorycard', '#2000sgaming'] },
  { name: 'weather-gadget', hook: 'Desktop gadgets were peak 2008', line: 'A frosted glass weather card with a live sky panel.', tags: ['#desktopgadgets', '#weather'] },
  { name: 'aqua-gel-desktop', hook: 'Lickable gel buttons, 2001', line: 'Pinstriped windows with red, amber and green gel buttons.', tags: ['#gelbuttons', '#2000sdesign'] },
  { name: 'vector-swoosh-art', hook: 'The 2007 vector wallpaper, generated live', line: 'Bezier swooshes, white pinstripes, halftone dots and starbursts.', tags: ['#vectorart', '#graphicdesign'] },
  { name: 'pipes-screensaver', hook: 'Staring at this screensaver for hours', line: 'Shiny 3D pipes growing through an invisible grid, never crossing.', tags: ['#pipes', '#screensaver'] },
  { name: 'media-player-visualizer', hook: 'Zoning out to the visualizer', line: 'A black-glass media player with a glowing play orb and a live visualizer.', tags: ['#visualizer', '#2000smusic'] },
  { name: 'translucent-gadgets', hook: 'When computers were see-through candy', line: 'A candy-coloured translucent all-in-one, a puck mouse and a coiled cable.', tags: ['#translucent', '#90sdesign'] },
  { name: 'spinning-text-screensaver', hook: 'Type your name. Watch it spin.', line: 'Extruded, bevelled 3D text tumbling on black.', tags: ['#3dtext', '#screensaver'] },
  { name: 'screensaver-picker', hook: 'Picking a screensaver was an event', line: 'Display Properties with a live CRT preview of five classic screensavers.', tags: ['#displaysettings', '#90scomputer'] },
];

export function buildCaption(script, style, index) {
  const tags = [...BASE_TAGS, STYLE_TAGS[style], ...script.tags].join(' ');
  return `${script.hook}\n\n${script.line}\n\n${QUESTIONS[index % QUESTIONS.length]}\n\n${tags}`;
}
