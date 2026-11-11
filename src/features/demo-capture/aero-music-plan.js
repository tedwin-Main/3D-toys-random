// Maps each reel and compilation to a curated Frutiger Aero track, artist and start time.

// YouTube IDs are pinned so a rebuild cannot silently pick a different upload.
// start is the second where the 20 s reel slice begins; secs is the download length.
export const REEL_MUSIC = [
  // 90s Desktop & Web
  { name: 'dial-up-connect', id: 'FqZaqPwEv64', title: 'Windows 95', artist: 'Che Mac', start: 5, why: 'modem-era PC nostalgia' },
  { name: 'boot-sequence', id: 'FqZaqPwEv64', title: 'Windows 95', artist: 'Che Mac', start: 55, why: 'cold boot, warm synth' },
  { name: 'virtual-pet-egg', id: 'P15Ldd_lSEM', title: 'New Look (Wii U Mii Maker Lofi Mix)', artist: 'Secret Potion', start: 10, why: 'cute menu loop' },
  { name: 'solitaire-win-cascade', id: '7gnFwdzKELk', title: 'Plaza', artist: 'Xploshi', start: 5, why: 'clean menu-game melody' },
  { name: 'maze-screensaver', id: 'cru2zx5-wU0', title: 'Traces', artist: 'Infinity Frequencies', start: 5, why: 'idle screensaver haze' },
  { name: 'desk-helper-assistant', id: 'HXrLJBjIyjk', title: '2005 Toyota Corolla', artist: 'hanahata', start: 10, why: 'jazzy office lounge' },
  { name: 'portal-homepage-1999', id: 'SXPivtxMHlM', title: 'Logging In', artist: 'Xploshi', start: 5, why: 'dial-up web portal' },
  { name: 'e-card-greeting', id: 'ZOICf8notK8', title: 'Morning Alarm', artist: 'Tsundere Twintails', start: 5, why: 'cute Flash-card chime' },
  { name: 'luna-desktop', id: 'Scw_anb0oig', title: 'A Brighter Age', artist: 'Dreamfibre', start: 600, why: 'XP Bliss optimism' },
  { name: 'defrag-visualizer', id: 'FqZaqPwEv64', title: 'Windows 95', artist: 'Che Mac', start: 110, why: 'HDD activity pulse' },
  { name: 'multimedia-encyclopedia', id: 'b12dBv7EDjU', title: 'LEASE', artist: 'Takeshi Abo', start: 5, why: 'CD-ROM menu theme' },
  { name: 'pipes-screensaver', id: 'Scw_anb0oig', title: 'A Brighter Age', artist: 'Dreamfibre', start: 1200, why: 'endless idle ambience' },
  { name: 'screensaver-picker', id: '-zixU9SzOWQ', title: 'fading', artist: '.diedlonely', start: 5, why: 'soft screensaver drift' },

  // Core Aero
  { name: 'aero-glass-desktop', id: 'EImjDC-CFHc', title: 'Frutiger Aero', artist: 'temcandoanything', start: 5, why: 'canonical Aero theme' },
  { name: 'click-wheel-player', id: 'w869Avr_fXI', title: 'Jerk It Out', artist: 'Caesars', start: 5, why: 'iPod ad era' },
  { name: 'glossy-messenger', id: 'SXPivtxMHlM', title: 'Logging In', artist: 'Xploshi', start: 55, why: 'sign-in chime warmth' },
  { name: 'cover-carousel', id: 'lWLNKSxvl1M', title: 'Star Sky', artist: 'Quill', start: 10, why: 'glossy album browsing' },
  { name: 'gel-button-maker', id: 'QUDuBp2y9P4', title: 'Helvetica Aqua Aero', artist: 'temcandoanything', start: 10, why: 'bubble UI gloss' },
  { name: 'pda-today-screen', id: 'b12dBv7EDjU', title: 'LEASE', artist: 'Takeshi Abo', start: 75, why: 'PDA menu calm' },
  { name: 'photo-gallery-viewer', id: 'Kcwq9NDb8m0', title: 'Lotus Waters', artist: 'Opunkt', start: 10, why: 'soft photo-library haze' },
  { name: 'weather-gadget', id: 'cbEFY8cWn90', title: 'Clear Skies', artist: 'PrismCorp Virtual Enterprises', start: 20, why: 'sidebar weather optimism' },
  { name: 'aqua-gel-desktop', id: 'Nj9czfiYd2E', title: 'Lemons', artist: 'Quill', start: 10, why: 'gel-button sparkle' },
  { name: 'media-player-visualizer', id: 'JrJNXQi4LlM', title: 'Neon Noir', artist: 'Sunset Drive', start: 10, why: 'visualizer night drive' },

  // Aquatic Aero
  { name: 'dolphin-lagoon', id: '-5rAjOjTGtc', title: 'Aquatic Ambience', artist: 'David Wise', start: 10, why: 'dolphin wallpaper canon' },
  { name: 'underwater-reef', id: 'Zqa2mgjbOIM', title: 'Dire, Dire Docks', artist: 'Koji Kondo', start: 10, why: 'underwater level calm' },
  { name: 'aquarium-icon-dock', id: 'AuGQqkEy3DA', title: "mermaid's cave", artist: 'Atenib', start: 15, why: 'aquarium glass dream' },
  { name: 'soap-bubbles-screensaver', id: 'DP3rDP02lE0', title: 'aquatic ambience', artist: 'Scizzie', start: 10, why: 'bubble screensaver drift' },

  // Console Menus
  { name: 'channel-menu', id: 'M50_93MReFU', title: 'Wii Menu Music', artist: 'Nintendo', start: 5, why: 'literal Wii channel grid' },
  { name: 'dvd-menu-2004', id: 'RVv8LOb96Mc', title: 'LittleBigPlanet — The Gardens', artist: 'Sony', start: 10, why: 'looping DVD menu warmth' },
  { name: 'media-bar-xmb', id: 'f2mvXaqpUxY', title: 'PS Vita Home Theme', artist: 'Sony', start: 5, why: 'smooth console XMB scroll' },
  { name: 'media-center-menu', id: 'M50_93MReFU', title: 'Wii Menu Music', artist: 'Nintendo', start: 75, why: 'couch media centre loop' },
  { name: 'blade-dashboard', id: '4RaguYU_SQI', title: 'Zen Garden (Xbox 360 Ambience)', artist: 'ArpWire TV', start: 300, why: 'Xbox blades ambience' },
  { name: 'memory-card-manager', id: '9X3-DE6aEhM', title: 'Photo Channel — SD Card Photo List', artist: 'Nintendo', start: 5, why: 'memory card file browser' },

  // Y2K Futurism
  { name: 'iridescent-cd-burner', id: 'Lgs9QUtWc3M', title: 'Better Off Alone', artist: 'Alice Deejay', start: 20, why: 'CD-burn trance' },
  { name: 'y2k-countdown', id: 'y6120QOlsfU', title: 'Sandstorm', artist: 'Darude', start: 55, why: 'millennium drop' },
  { name: 'wordart-studio', id: '68ugkg9RePc', title: 'Blue (Da Ba Dee)', artist: 'Eiffel 65', start: 30, why: 'WordArt Eurodance' },
  { name: 'skinnable-mp3-player', id: 'K0HSD_i2DvA', title: 'Around the World', artist: 'Daft Punk', start: 30, why: 'MP3 player loop' },
  { name: 'flash-intro-2002', id: 'DvyCbevQbtI', title: 'Children', artist: 'Robert Miles', start: 30, why: 'Flash intro dream' },
  { name: 'y2k-chrome-landing', id: 'efjc146v3hA', title: 'Castles in the Sky', artist: 'Ian Van Dahl', start: 30, why: 'chrome optimism' },
  { name: 'translucent-gadgets', id: 'FQlAEiCb8m0', title: 'Music Sounds Better With You', artist: 'Stardust', start: 30, why: 'translucent candy plastic' },
  { name: 'spinning-text-screensaver', id: 'QFGMQZyvnmY', title: '9 PM (Till I Come)', artist: 'ATB', start: 30, why: 'spinning text trance' },

  // McBling
  { name: 'mcbling-page', id: 'LOZuxwVk7TU', title: 'Toxic', artist: 'Britney Spears', start: 5, why: '2005 sparkle pop' },
  { name: 'flip-phone-ui', id: '0J3vgcE5i2o', title: 'Promiscuous', artist: 'Nelly Furtado', start: 10, why: 'flip-phone club pop' },
  { name: 'throwback-profile-desktop', id: 'GxBSyx85Kp8', title: 'Yeah!', artist: 'Usher', start: 10, why: 'MySpace-era crunk pop' },

  // Eco Aero
  { name: 'bubble-meadow', id: 'BSqYgIHgqFI', title: 'Stickerbush Symphony', artist: 'David Wise', start: 20, why: 'green meadow wallpaper' },
  { name: 'eco-glass-globe', id: 'NZXzNk0dhQk', title: 'Emerald Horizons', artist: 'Dreamfibre', start: 600, why: 'corporate eco glass' },
  { name: 'frutiger-eco-site', id: 'toUlsqKCNqg', title: 'Forest Interlude', artist: 'David Wise', start: 20, why: 'green energy website' },

  // Frutiger Metro
  { name: 'metro-live-tiles', id: 'wlfxjNeViHk', title: '3DS Internet Settings Theme', artist: 'Nintendo', start: 5, why: 'flat tile menu' },

  // Skeuomorphism
  { name: 'skeuo-notes-shelf', id: 'wA0kyhw_1Xo', title: 'Skeuomorphism', artist: 'DJ Intranet', start: 20, why: 'literal leather-and-wood lounge' },

  // Humanity Aero
  { name: 'airport-kiosk', id: 'yi9xkK8rZl8', title: 'Demo Booth', artist: 'Xploshi', start: 5, why: 'kiosk demo optimism' },
  { name: 'plaza-avatars', id: '7gnFwdzKELk', title: 'Plaza', artist: 'Xploshi', start: 55, why: 'avatar plaza social' },
  { name: 'humanity-corporate-site', id: 'SXPivtxMHlM', title: 'Logging In', artist: 'Xploshi', start: 75, why: 'smiling stock people' },

  // Space Aero
  { name: 'aurora-login-screen', id: '-4c0G2sY-lQ', title: 'Mesosphere', artist: 'Xploshi', start: 5, why: 'aurora login calm' },
  { name: 'glossy-space', id: 'PNqYLWhKHGc', title: 'The Descent', artist: 'Infinity Frequencies', start: 5, why: 'wallpaper space drift' },

  // Technozen
  { name: 'technozen-spa', id: 'm8fKw0QMXug', title: 'June 2011 (3DS)', artist: 'Nintendo eShop', start: 5, why: 'spa-calm eShop' },

  // Web 2.0 & Vectorheart
  { name: 'web2-beta-landing', id: 'u3rGy-LZ20M', title: 'VECTOR HEART', artist: 'Dreamthorne', start: 10, why: 'Web 2.0 beta energy' },
  { name: 'vector-swoosh-art', id: 'u7lQEELRjJY', title: 'Vectorheart — Formulas', artist: 'vera', start: 5, why: 'vector swoosh wallpaper' },

  // Dark Aero
  { name: 'dark-aero-night', id: '8GW6sLrK40k', title: 'Resonance', artist: 'HOME', start: 10, why: 'Aero after dark' },
  { name: 'glass-ribbons-screensaver', id: 'MV_3Dpw-BRY', title: 'Nightcall', artist: 'Kavinsky', start: 20, why: 'hypnotic ribbon night' },

  // Glass City
  { name: 'rooftop-runner', id: 'B0I9M86BnF4', title: 'Rooftop Run (Day)', artist: 'Sonic Unleashed', start: 10, why: 'white rooftop sprint' },
  { name: 'runner-route-planner', id: '5WcyVvWZJU4', title: 'Escape From the City', artist: 'Sonic Adventure 2', start: 5, why: 'route-planning speed' },
  { name: 'courier-network-hud', id: 'wy9r2qeouiQ', title: 'Turbo Killer', artist: 'Carpenter Brut', start: 10, why: 'courier HUD pulse' },
  { name: 'glass-tower-skyline', id: 'ND-4SmGaGyU', title: 'Ocean Drive', artist: 'Miami Nights 1984', start: 20, why: 'glass avenue glide' },
  { name: 'skyline-ambient-synth', id: 'Scw_anb0oig', title: 'A Brighter Age', artist: 'Dreamfibre', start: 1800, why: 'live skyline ambience' },
];

// One continuous bed per compilation; looped if the video outruns the slice.
export const STYLE_MUSIC = {
  core: { id: 'EImjDC-CFHc', title: 'Frutiger Aero', artist: 'temcandoanything', start: 5, secs: 60 },
  eco: { id: 'BSqYgIHgqFI', title: 'Stickerbush Symphony', artist: 'David Wise', start: 20, secs: 60 },
  dark: { id: '8GW6sLrK40k', title: 'Resonance', artist: 'HOME', start: 10, secs: 60 },
  aquatic: { id: '-5rAjOjTGtc', title: 'Aquatic Ambience', artist: 'David Wise', start: 10, secs: 60 },
  humanity: { id: '7gnFwdzKELk', title: 'Plaza', artist: 'Xploshi', start: 5, secs: 60 },
  technozen: { id: 'm8fKw0QMXug', title: 'June 2011 (3DS)', artist: 'Nintendo eShop', start: 5, secs: 60 },
  space: { id: '-4c0G2sY-lQ', title: 'Mesosphere', artist: 'Xploshi', start: 5, secs: 60 },
  metro: { id: 'wlfxjNeViHk', title: '3DS Internet Settings Theme', artist: 'Nintendo', start: 5, secs: 60 },
  glasscity: { id: 'ND-4SmGaGyU', title: 'Ocean Drive', artist: 'Miami Nights 1984', start: 20, secs: 60 },
  console: { id: 'M50_93MReFU', title: 'Wii Menu Music', artist: 'Nintendo', start: 5, secs: 60 },
  y2k: { id: 'Lgs9QUtWc3M', title: 'Better Off Alone', artist: 'Alice Deejay', start: 20, secs: 60 },
  mcbling: { id: 'LOZuxwVk7TU', title: 'Toxic', artist: 'Britney Spears', start: 5, secs: 60 },
  vectorheart: { id: 'u3rGy-LZ20M', title: 'VECTOR HEART', artist: 'Dreamthorne', start: 10, secs: 60 },
  skeuo: { id: 'wA0kyhw_1Xo', title: 'Skeuomorphism', artist: 'DJ Intranet', start: 20, secs: 60 },
  retro: { id: 'FqZaqPwEv64', title: 'Windows 95', artist: 'Che Mac', start: 5, secs: 60 },
};

export const MASTER_MUSIC = { id: 'Scw_anb0oig', title: 'A Brighter Age', artist: 'Dreamfibre', start: 600, secs: 120 };
