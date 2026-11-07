// Lists the 59 aero reels in posting order with hook, caption copy, comment prompt and hashtags.

const ANCHOR_TAG = '#frutigeraero';
const HASHTAG_LIMIT = 5;
const EMOJI = /\p{Extended_Pictographic}/u;
const STYLE_TAGS = {
  core: '#aeroaesthetic', eco: '#ecoaero', dark: '#darkaero', aquatic: '#aquaticaero', humanity: '#humanityaero',
  technozen: '#technozen', space: '#spaceaero', metro: '#frutigermetro', console: '#2000sgaming', y2k: '#y2kaesthetic',
  mcbling: '#mcbling', vectorheart: '#web20', skeuo: '#skeuomorphism', retro: '#90skid',
};
// Rotating share/save/follow prompts: sends and saves drive reel reach
const CTAS = [
  'Send this to someone who remembers.', 'Save it for your next nostalgia spiral.', 'Follow for a new Aero memory every day.',
  'Tag the friend you shared a PC with.', 'Share it to your story if you lived this.',
];

// Posting order: strongest openers first, styles interleaved. Hook = caption line 1 = routine's "already posted" key; never edit hooks of posted days
export const REEL_SCRIPTS = [
  { name: 'dial-up-connect', hook: "POV: it's 1999 and you're getting online", line: 'A working dial-up dialer: dial tone, DTMF beeps and the full handshake screech, synthesized live in the browser. Sound on.', ask: 'What did you do while it connected?', tags: ['#dialup', '#90sinternet', '#oldinternet'] },
  { name: 'aero-glass-desktop', hook: 'Your 2007 desktop just woke up', line: 'Frosted glass windows, glowing captions and a tray balloon chime. Pure Frutiger Aero, rebuilt live with zero images.', ask: 'What was your wallpaper back then?', tags: ['#glassui', '#2000stech', '#2000snostalgia'] },
  { name: 'dolphin-lagoon', hook: 'This dolphin wallpaper lived on every PC', line: 'The turquoise lagoon from every 2000s desktop, rebuilt as a live 3D Aquatic Aero scene. No stock image, all code.', ask: 'Which room was your family computer in?', cta: 'Send this to whoever had it as their background.', tags: ['#y2kwallpaper', '#2000snostalgia', '#dolphins'] },
  { name: 'boot-sequence', hook: 'The sound every 1998 morning started with', line: 'CRT warm-up, BIOS memory count, the PC speaker beep. One full power cycle, recreated live in the browser. Sound on.', ask: 'How old were you the first time you heard this?', cta: 'Follow for a new Aero memory every day.', tags: ['#retrocomputing', '#crtmonitor', '#oldcomputer'] },
  { name: 'channel-menu', hook: 'Turning on the console after school', line: 'Rounded white channel tiles, each running its own tiny live animation. You can almost hear the menu music.', ask: 'Which channel did you open first?', cta: 'Tag your old player 2.', tags: ['#gamingnostalgia', '#consolemenu', '#y2kaesthetic'] },
  { name: 'iridescent-cd-burner', hook: 'Burning a mix CD for your crush', line: 'A blank disc spins and throws rainbow light while the burn bar crawls to 100%. Do NOT bump the desk.', ask: 'Track 1 on your mix was ______', cta: 'Save this for your next nostalgia spiral.', tags: ['#mixcd', '#2000smusic', '#2000snostalgia'] },
  { name: 'bubble-meadow', hook: 'The wallpaper that defined 2008', line: 'Green hills, a mirror lake and 40,000 blades of grass swaying live in 3D. Peak Eco Aero calm.', ask: 'Rate this 1 to 10 for instant calm', cta: 'Send it to someone who needs a breather today.', tags: ['#aestheticwallpaper', '#2000snostalgia', '#3dart'] },
  { name: 'mcbling-page', hook: 'Your 2005 page had THIS much sparkle', line: 'Pink camo, flickering glitter text and rhinestone boxes. McBling at full volume.', ask: 'What was your profile song?', tags: ['#2000saesthetic', '#glittertext', '#2000snostalgia'] },
  { name: 'virtual-pet-egg', hook: "Don't let it die this time", line: 'A see-through keychain pet on a dot-matrix screen. Feed it, play with it, clean up after it.', ask: 'How many did you lose to school days?', tags: ['#virtualpet', '#90stoys', '#digitalpet'] },
  { name: 'metro-live-tiles', hook: 'The year glass went flat', line: 'A sideways wall of live tiles that peek, flip and slide in thin light type. The moment Aero went flat.', ask: 'Glossy or flat: which side are you on?', tags: ['#metroui', '#flatdesign', '#2010snostalgia'] },
  { name: 'click-wheel-player', hook: 'Scrolling to your song in 2005', line: 'A glossy white pocket player with a working click wheel and sliding menus. Frutiger Aero in your pocket.', ask: 'First song you loaded on yours?', tags: ['#mp3player', '#2000smusic', '#2000snostalgia'] },
  { name: 'underwater-reef', hook: 'Aquatic Aero at max saturation', line: 'A sunlit coral reef with dancing caustics and shafts of light, live in 3D.', ask: 'Would you set this as your wallpaper?', tags: ['#underwater', '#oceanaesthetic', '#y2kwallpaper'] },
  { name: 'y2k-countdown', hook: '10 seconds before the year 2000', line: 'Glowing seven-segment digits count down the millennium at a Y2K readiness centre.', ask: 'Where were you when the clock hit 2000?', tags: ['#y2k', '#millennium', '#newyearseve'] },
  { name: 'dvd-menu-2004', hook: 'The DVD menu you let loop forever', line: 'Sunlit water, lens streaks, film grain and a glossy title menu for a summer film that never existed.', ask: 'Which DVD menu did you let loop the most?', tags: ['#dvdmenu', '#2000smovies', '#2000snostalgia'] },
  { name: 'skeuo-notes-shelf', hook: 'When apps were made of leather and wood', line: 'A stitched leather notepad beside a wooden bookshelf. Peak 2010 skeuomorphic design.', ask: 'Bring back textures? Yes or no', tags: ['#appdesign', '#uidesign', '#2010snostalgia'] },
  { name: 'glossy-messenger', hook: 'Your crush just came online', line: 'A glossy buddy list with status gems, nudges and now-playing messages. Frutiger Aero chat at its finest.', ask: 'What was your away message?', cta: 'Send this to your first online crush.', tags: ['#instantmessenger', '#2000skid', '#2000sinternet'] },
  { name: 'solitaire-win-cascade', hook: 'The win screen we all lived for', line: 'Klondike on green felt, ending in the card cascade we all played for.', ask: 'How many hours did you lose to this?', tags: ['#solitaire', '#90scomputer', '#oddlysatisfying'] },
  { name: 'aurora-login-screen', hook: 'Click your name to log in, 2007', line: 'Aurora ribbons and light streaks behind glossy user tiles on a deep teal sky.', ask: 'What was your username?', tags: ['#loginscreen', '#aurora', '#2000snostalgia'] },
  { name: 'flip-phone-ui', hook: 'Texting on a flip phone in 2006', line: 'Signal bars, a bubbly wallpaper and a 3x3 grid of glossy menu icons.', ask: 'What was your ringtone?', tags: ['#flipphone', '#2000sphone', '#2000snostalgia'] },
  { name: 'technozen-spa', hook: 'The calmest corner of the 2000s', line: 'A misty pool, balancing pebbles and swaying bamboo. Technozen, the calmest side of Frutiger Aero.', ask: 'Rate the calm 1 to 10', cta: 'Save this for a stressful day.', tags: ['#zen', '#spaaesthetic', '#calmvibes'] },
  { name: 'web2-beta-landing', hook: 'Every 2006 startup looked like this', line: 'Glossy header, reflected logo and an orange BETA badge for a made-up social site.', ask: 'Which beta did you sign up for first?', tags: ['#startup', '#webdesign', '#2000sinternet'] },
  { name: 'maze-screensaver', hook: 'Left your PC idle in 1998?', line: 'The first-person brick maze screensaver, carved fresh every run.', ask: 'Did you ever find the exit?', tags: ['#screensaver', '#retrogaming', '#90scomputer'] },
  { name: 'media-bar-xmb', hook: 'That smooth console menu scroll', line: 'A row of line-art categories crossed by a column of items, floating on a soft wave.', ask: 'Which console menu was the smoothest?', cta: 'Tag your old player 2.', tags: ['#consolemenu', '#gamingnostalgia', '#2000snostalgia'] },
  { name: 'eco-glass-globe', hook: 'Every 2008 corporate slide had this', line: 'A procedural planet inside a refracting glass orb on a chrome stand. Eco Aero corporate optimism.', ask: 'Which company slide deck had this?', tags: ['#glassorb', '#stockimage', '#2000snostalgia'] },
  { name: 'throwback-profile-desktop', hook: 'A 2007 afternoon on one screen', line: 'Glitter profile name, a blinking Online Now! and a messenger window popping up.', ask: 'Who was in your top friends?', tags: ['#2000sinternet', '#profilepage', '#2000snostalgia'] },
  { name: 'glossy-space', hook: 'Space Aero wallpaper, but alive', line: 'A glossy blue-green planet with a sun glint, drifting clouds and city lights at night.', ask: 'Would you set this as your wallpaper?', tags: ['#space', '#planet', '#y2kwallpaper'] },
  { name: 'desk-helper-assistant', hook: "The helper that wouldn't leave you alone", line: 'Orbit the satellite robot floats over your 1998 document, eager to help.', ask: 'Helpful or annoying?', tags: ['#90soffice', '#retrotech', '#90scomputer'] },
  { name: 'cover-carousel', hook: 'Flipping through albums in 2006', line: '24 hand-painted album covers sliding past in glossy 3D.', ask: 'First album you ever bought?', tags: ['#albumart', '#musicnostalgia', '#2000smusic'] },
  { name: 'portal-homepage-1999', hook: 'The 1999 homepage was a LOT', line: 'Tiled stars, a spinning wireframe globe, rotating banner ads and a scrolling marquee.', ask: 'What was your homepage?', tags: ['#90sweb', '#oldinternet', '#90sinternet'] },
  { name: 'dark-aero-night', hook: 'Frutiger Aero, after dark', line: 'An aurora sky full of stars over a still lake that reflects everything.', ask: 'Light Aero or Dark Aero?', tags: ['#darkaesthetic', '#aurora', '#y2kwallpaper'] },
  { name: 'e-card-greeting', hook: 'Someone sent you an e-card in 2000', line: 'The sealed envelope opens, the card slides out and unfolds with a little tune.', ask: 'Who still owes you an e-card?', cta: 'Send this to someone as a 2000s e-card.', tags: ['#ecard', '#oldinternet', '#2000snostalgia'] },
  { name: 'gel-button-maker', hook: 'Every 2006 design blog linked this', line: 'A glossy gel button generator: pick the hue, shape, gloss and reflection.', ask: 'Which colour would you pick?', tags: ['#webdesign', '#glossybuttons', '#2000sdesign'] },
  { name: 'airport-kiosk', hook: 'Checking in for a flight in 2008', line: 'A bright glossy touch kiosk while planes taxi past tall sunny windows. Humanity Aero optimism.', ask: 'Where was your first flight to?', tags: ['#airport', '#travelnostalgia', '#2000snostalgia'] },
  { name: 'wordart-studio', hook: 'Every school newsletter title ever', line: 'Twelve fancy text styles: rainbow arch, chrome 3D, waving blue and more.', ask: 'Which style did your school use?', tags: ['#wordart', '#schoolmemories', '#2000snostalgia'] },
  { name: 'aquarium-icon-dock', hook: 'App icons in a living aquarium', line: 'Glossy 3D icons on a glass shelf while fish school through rising bubbles.', ask: 'Would you use this as your desktop?', tags: ['#aquarium', '#icons', '#2000snostalgia'] },
  { name: 'media-center-menu', hook: 'Couch, remote, 2005 media centre', line: 'Deep blue waves, a green orb and a menu that rolls like a wheel.', ask: 'What did you watch on it?', tags: ['#mediacenter', '#tvnostalgia', '#2000snostalgia'] },
  { name: 'skinnable-mp3-player', hook: 'Your first skinnable MP3 player', line: 'Seven-segment time, scrolling song title, ten-band EQ and a docked playlist.', ask: 'What skin did you use?', tags: ['#mp3', '#90smusic', '#2000smusic'] },
  { name: 'luna-desktop', hook: 'That green hill. That blue sky. 2001.', line: 'A glossy blue taskbar, a fat green start button and that hill wallpaper.', ask: 'What was on your desktop?', tags: ['#2001', '#desktop', '#2000snostalgia'] },
  { name: 'frutiger-eco-site', hook: 'Green energy websites in 2008', line: 'Rolling hills, spinning wind turbines and a sun over the lake, all live. Eco Aero web design at its greenest.', ask: 'Bring back hopeful websites?', tags: ['#greenenergy', '#webdesign', '#2000snostalgia'] },
  { name: 'pda-today-screen', hook: 'Tapping a stylus in 2003', line: 'A pocket PC Today screen with handwriting ink over a painted lake.', ask: 'Did you ever lose the stylus?', tags: ['#pda', '#retrotech', '#2000stech'] },
  { name: 'flash-intro-2002', hook: 'Click to enter. Skip intro?', line: 'A pixel preloader counts to 100%, then chrome swooshes take over the splash page.', ask: 'Skip intro or watch it every time?', tags: ['#flashintro', '#oldweb', '#2000sinternet'] },
  { name: 'plaza-avatars', hook: 'Hanging out in the avatar plaza', line: 'A crowd of chibi characters with big round heads wandering a bright plaza.', ask: 'What did your avatar look like?', tags: ['#avatar', '#gamingnostalgia', '#2000snostalgia'] },
  { name: 'defrag-visualizer', hook: 'The most satisfying thing in 1998', line: 'Watch the cluster map get defragmented block by block.', ask: 'Did you watch it all the way to 100%?', tags: ['#defrag', '#oddlysatisfying', '#90scomputer'] },
  { name: 'blade-dashboard', hook: 'Flipping through the 2005 console blades', line: 'Five coloured blades stacked like pages in 3D.', ask: 'Blades or tiles?', tags: ['#consolemenu', '#gamingnostalgia', '#2000snostalgia'] },
  { name: 'soap-bubbles-screensaver', hook: 'This screensaver lived on every office PC', line: 'Glassy soap bubbles drift, bounce and refract the desktop behind them.', ask: 'Which screensaver did your office PC run?', tags: ['#bubbles', '#screensaver', '#2000snostalgia'] },
  { name: 'y2k-chrome-landing', hook: 'Tech optimism on the eve of 2000', line: 'A liquid chrome blob logo rippling under studio light strips.', ask: 'Was the future better in 1999?', tags: ['#chrome', '#y2kdesign', '#y2k'] },
  { name: 'photo-gallery-viewer', hook: 'Browsing your 2007 photo library', line: 'A glass window, a glossy toolbar, a tag tree and a thumbnail grid.', ask: "What's the oldest photo you still have?", tags: ['#photogallery', '#2000stech', '#2000snostalgia'] },
  { name: 'humanity-corporate-site', hook: 'Smiling stock people, 2008 edition', line: 'A corporate brochure site full of procedurally drawn smiling people. Humanity Aero, maximum optimism.', ask: 'Which company site looked like this?', tags: ['#stockphoto', '#corporate', '#2000snostalgia'] },
  { name: 'multimedia-encyclopedia', hook: 'Homework in 1995 meant this CD-ROM', line: 'A spinning globe, chunky toolbar buttons and an A to Z index.', ask: 'What did you look up first?', tags: ['#cdrom', '#90sschool', '#90scomputer'] },
  { name: 'glass-ribbons-screensaver', hook: 'The screensaver that hypnotized us', line: 'Translucent glass ribbons looping through dark blue space.', ask: 'How long could you stare at this?', tags: ['#screensaver', '#hypnotic', '#oddlysatisfying'] },
  { name: 'memory-card-manager', hook: 'Is there enough space on your memory card?', line: 'Two 15-block cards and spinning 3D save icons over slow blue light.', ask: 'Which save would you never delete?', tags: ['#memorycard', '#gamingnostalgia', '#2000snostalgia'] },
  { name: 'weather-gadget', hook: 'Desktop gadgets were peak 2008', line: 'A frosted glass weather card with a live sky panel.', ask: 'Which desktop gadget did you keep?', tags: ['#desktopgadgets', '#weather', '#2000stech'] },
  { name: 'aqua-gel-desktop', hook: 'Lickable gel buttons, 2001', line: 'Pinstriped windows with red, amber and green gel buttons.', ask: 'Would you lick it? Be honest', tags: ['#gelbuttons', '#2000sdesign', '#2000snostalgia'] },
  { name: 'vector-swoosh-art', hook: 'The 2007 vector wallpaper, generated live', line: 'Bezier swooshes, white pinstripes, halftone dots and starbursts.', ask: 'Did you have this as a wallpaper?', tags: ['#vectorart', '#graphicdesign', '#2000sdesign'] },
  { name: 'pipes-screensaver', hook: 'Staring at this screensaver for hours', line: 'Shiny 3D pipes growing through an invisible grid, never crossing.', ask: 'Did you wait for it to fill the whole screen?', tags: ['#pipes', '#screensaver', '#oddlysatisfying'] },
  { name: 'media-player-visualizer', hook: 'Zoning out to the visualizer', line: 'A black-glass media player with a glowing play orb and a live visualizer.', ask: 'What song were you zoning out to?', tags: ['#visualizer', '#2000smusic', '#2000snostalgia'] },
  { name: 'translucent-gadgets', hook: 'When computers were see-through candy', line: 'A candy-coloured translucent all-in-one, a puck mouse and a coiled cable.', ask: 'Which colour did you have?', tags: ['#translucent', '#90sdesign', '#retrotech'] },
  { name: 'spinning-text-screensaver', hook: 'Type your name. Watch it spin.', line: 'Extruded, bevelled 3D text tumbling on black.', ask: 'What did you make yours say?', tags: ['#3dtext', '#screensaver', '#oddlysatisfying'] },
  { name: 'screensaver-picker', hook: 'Picking a screensaver was an event', line: 'Display Properties with a live CRT preview of five classic screensavers.', ask: 'Which one did you pick?', tags: ['#displaysettings', '#90scomputer', '#screensaver'] },
];

export function buildCaption(script, style, index) {
  const cta = script.cta ?? CTAS[index % CTAS.length];
  const caption = `${script.hook}\n\n${script.line}\n\n${script.ask}\n${cta}\n\n${captionHashtags(script, style).join(' ')}`;
  if (EMOJI.test(caption)) throw new Error(`${script.name}: captions must not contain emoji`);
  return caption;
}

// Anchor + style niche + 3 per-reel tags; Instagram caps posts at 5 hashtags
function captionHashtags(script, style) {
  const tags = [ANCHOR_TAG, STYLE_TAGS[style], ...script.tags];
  if (new Set(tags).size !== HASHTAG_LIMIT) throw new Error(`${script.name}: need ${HASHTAG_LIMIT} unique hashtags, got ${tags.join(' ')}`);
  return tags;
}
