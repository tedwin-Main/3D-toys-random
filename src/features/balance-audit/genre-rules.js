// Lists each multiplayer toy's genre rule, its outside reference, and the live check the audit runs for it.

// Fields (all optional except rule/ref):
//   rule: plain-words rule the live check enforces; ref: outside source for the genre rule
//   inv: JS expression in page scope over P (players), w (world), S_ (turn state), ph (phase); '' = ok, text = violation
//   score: JS expression over p (higher is better) used to rank a match; list: players expression when not S.P / world.players
//   end: phase that ends a match without going back to the lobby (the audit restarts it); pre: JS run before each sample
//   phase: page expression for the phase when it is not S.ph / world.phase
//   serverRun: sim runs on the relay server (no page time warp); scoreless: no winner by design (sandbox)
//   edge: skill-test bar as a multiple of fair share (default 2; 1.5 where the genre has built-in luck: hot potato, secret simultaneous moves, crowded free-for-alls)
const placesAre1toN = `(()=>{const pl=P.map(p=>p.place).filter(x=>x>0).sort((a,b)=>a-b);return pl.length===P.length&&pl.every((v,i)=>v===i+1)?'':'places '+pl})()`;
const lastStandingEndsRound = (phase) => `ph==='${phase}'&&P.filter(p=>p.alive).length>1?'round with '+P.filter(p=>p.alive).length+' alive':''`;
const noNegative = (field) => `P.some(p=>p.${field}<0)?'negative ${field}':''`;

export const GAME_RULES = {
  'balloon-battle': { serverRun: true, rule: 'pops never negative', ref: 'https://www.fatherly.com/entertainment/stomp-the-balloon-game', inv: noNegative('pops') },
  'bank-or-bust': { serverRun: true, score: 'p.total', rule: 'one 1 busts the round, double 1 wipes the total; totals never negative', ref: 'https://en.wikipedia.org/wiki/Pig_(dice_game)', inv: noNegative('total') },
  'bomb-tag-arena': { serverRun: true, edge: 1.5,
    rule: 'bomb holders 1..alive-1 while fuse burns; round ends at ≤1 alive', ref: 'https://en.wikipedia.org/wiki/Hot_potato_(game)',
    inv: `ph==='play'?(()=>{const al=P.filter(p=>p.alive),h=al.filter(p=>p.bomb).length;return al.length>1&&(h<1||h>al.length-1)?'bombs '+h+'/'+al.length:''})():${lastStandingEndsRound('round')}`,
  },
  'bumper-sumo-arena': { serverRun: true, rule: 'round ends when ≤1 car left in the ring', ref: 'https://en.wikipedia.org/wiki/Sumo', inv: `ph==='roundEnd'&&P.filter(p=>p.inRound&&p.alive).length>1?'roundEnd with '+P.filter(p=>p.inRound&&p.alive).length+' in ring':''` },
  'fence-fields': { serverRun: true, rule: 'closing a box scores and moves again; scores never negative', ref: 'https://en.wikipedia.org/wiki/Dots_and_boxes', inv: noNegative('score') },
  'gem-diggers': { serverRun: true, rule: 'gem = dig again (Minesweeper Flags); random first digger', ref: 'https://www.novelgames.com/minesflagger' },
  'hex-drop-survival': { serverRun: true, rule: 'last one standing ends the round', ref: 'https://en.wikipedia.org/wiki/Fall_Guys', inv: lastStandingEndsRound('round') },
  'jar-guess': { serverRun: true, rule: 'closest guess ranks first, ties share a place', ref: 'https://en.wikipedia.org/wiki/Ranking#Standard_competition_ranking_(%221224%22_ranking)', inv: noNegative('score') },
  'kart-race-online': { serverRun: true, list: 'world.karts', score: '-p.place', end: 'end', rule: 'each kart gets a distinct finishing place', ref: 'https://www.mariowiki.com/Item_Box', inv: `ph==='end'?(()=>{const pl=P.filter(p=>p.bot).map(p=>p.place).sort((a,b)=>a-b);return new Set(pl).size===pl.length?'':'dup places '+pl})():''` },
  'king-of-the-hill': { serverRun: true, rule: 'ring points split by everyone inside; never negative', ref: 'https://en.wikipedia.org/wiki/King_of_the_Hill_(game)', inv: noNegative('pts') },
  'lava-rise-climb': { serverRun: true, score: '-p.place', rule: 'final places are exactly 1..N', ref: 'https://en.wikipedia.org/wiki/King_of_the_Hill_(game)', inv: `ph==='final'?${placesAre1toN}:''` },
  'light-cycle-arena': { serverRun: true, edge: 1.5, rule: 'last cycle riding ends the round', ref: 'https://ossblog.org/armagetron-advanced-tron-clone-3d', inv: lastStandingEndsRound('round') },
  'lucky-low': { serverRun: true,
    rule: 'lowest number nobody else picked wins', ref: 'https://en.wikipedia.org/wiki/Unique_bid_auction',
    inv: `ph==='reveal'&&S_.res&&S_.res.win!=null?(()=>{const v=Object.values(S_.res.picks||{}).map(Number).filter(x=>x>0),c=new Map();v.forEach(x=>c.set(x,(c.get(x)||0)+1));const low=Math.min(...[...c].filter(([,n])=>n===1).map(([x])=>x));return S_.res.v===low?'':'win '+S_.res.v+' not lowest unique '+low})():''`,
  },
  'mini-golf-party': { serverRun: true, list: 'world.balls', score: '-(p.scores||[]).reduce((a,b)=>a+(b??0),0)', rule: 'not holed after 6 strokes scores 7; hole scores 1..7', ref: 'https://rosfjord.no/en/minigolf-park/course-rules/', inv: `P.some(p=>(p.scores||[]).some(s=>s!=null&&(s<1||s>7)))?'hole score out of 1..7':''` },
  'musical-chairs-party': { serverRun: true, score: '-p.place', rule: 'chairs = players left − 1; final places 1..N', ref: 'https://en.wikipedia.org/wiki/Musical_chairs', inv: `ph==='scramble'?(()=>{const n=P.filter(p=>!p.out).length;return w.chairs.length===Math.max(1,n-1)?'':'chairs '+w.chairs.length+' for '+n})():ph==='final'?${placesAre1toN}:''` },
  'paint-territory': { serverRun: true, edge: 1.5, pre: 'countTiles()', score: 'p.tiles', rule: 'tile shares in [0,1], sum ≤ 1', ref: 'https://en.wikipedia.org/wiki/Splatoon#Turf_War', inv: `P.some(p=>p.tiles<0||p.tiles>1)||P.reduce((a,p)=>a+p.tiles,0)>1.0001?'tile share out of range':''` },
  'penguin-curling': { serverRun: true, rule: 'last place throws last (the hammer) from end 2', ref: 'https://nbcolympics.com/post/220646', inv: `ph==='aim'&&w.round>1&&w.order.length>2?(()=>{const h=w.players.get(w.order[w.order.length-1]);return h&&P.some(p=>p.score<h.score)?'hammer '+h.score+' not last place':''})():''` },
  'picnic-dash': { serverRun: true, edge: 1.5, rule: 'simultaneous moves; scores never negative', ref: 'https://en.wikipedia.org/wiki/Simultaneous_action_selection', inv: noNegative('score') },
  'pirate-cannon-clash': { serverRun: true, list: 'ships', score: 'p.kills', rule: 'kills never negative', ref: 'https://en.wikipedia.org/wiki/Deathmatch_(video_games)', inv: noNegative('kills') },
  'rocket-ball-soccer': { serverRun: true, rule: 'goals never negative; kickoff boost 33', ref: 'https://dignitas.gg/articles/boost-management-in-rocket-league', inv: noNegative('goals') },
  'sheepdog-rush': { serverRun: true, rule: 'sheep only score in a pen; never negative', ref: 'https://en.wikipedia.org/wiki/Sheepdog_trial', inv: noNegative('score') },
  'siege-hills': { serverRun: true,
    rule: "turns rotate: survivors' shot counts differ ≤1 per round", ref: 'https://en.wikipedia.org/wiki/Worms_(series)#Gameplay',
    inv: `(()=>{const g=window.__sg??={rd:-1,n:-1,c:{}};if(S_.rd!==g.rd){g.rd=S_.rd;g.c={};g.done=false}if(S_.shot&&S_.shot.n!==g.n){g.n=S_.shot.n;g.c[S_.shot.by]=(g.c[S_.shot.by]||0)+1}if(ph==='round'&&!g.done){g.done=true;const v=P.filter(p=>p.alive).map(p=>g.c[p.id]||0);if(v.length&&Math.max(...v)-Math.min(...v)>1)return 'survivor shots '+v}return ''})()`,
  },
  'snowball-fight-arena': { serverRun: true, rule: 'hits never negative', ref: 'https://en.wikipedia.org/wiki/Snowball_fight', inv: noNegative('score') },
  'tank-battle-maze': { serverRun: true, score: 'p.kills', rule: 'free-for-all kills; self-kill costs one (Doom Deathmatch 2.0)', ref: 'https://en.wikipedia.org/wiki/Deathmatch_(video_games)' },
  'treasure-auction': { serverRun: true,
    score: 'p.coins+p.loot', rule: 'tied bids cancel, top unique bid wins treasure; coins never negative', ref: 'https://gamesushi.github.io/quartz/Auctions/Sealed-Bid-with-Cancellation',
    inv: `P.some(p=>p.coins<0)?'negative coins':(ph==='result'&&S_.res&&S_.lot.v>0&&S_.res.win.length)?(()=>{const b=Object.values(S_.res.bids),c=new Map();b.forEach(v=>c.set(v,(c.get(v)||0)+1));const top=Math.max(...[...c].filter(([v,n])=>n===1&&v>0).map(([v])=>v));return S_.res.bids[S_.res.win[0]]===top?'':'winner bid '+S_.res.bids[S_.res.win[0]]+' not top unique '+top})():''`,
  },
  'voxel-build-together': { serverRun: true, scoreless: true, rule: 'sandbox: no winner; the relay server orders edits (see voxel-sync-audit.js)', ref: 'https://en.wikipedia.org/wiki/Minecraft#Creative' },
  'wheres-waldo-game': { serverRun: true, list: 'ui.view&&ui.view.players', phase: 'ui.view&&ui.view.phase', end: 'gameEnd', rule: 'scores never negative', ref: 'https://en.wikipedia.org/wiki/Where%27s_Wally%3F', inv: noNegative('score') },
};
