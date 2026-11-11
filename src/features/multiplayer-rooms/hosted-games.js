// Lists games whose host runs on the relay server (party royale rounds, the full show, kart, turbo ball, bumper sumo, hot potato, crown keep, chair scramble, balloon battle, sheepdog rush, snowball brawl, tank brawl, cannon cove, hex drop, splat turf, penguin curling, mini golf, light cycles, floor is lava, block party, waldo hunt, and the turn games: bank or bust, lucky low, jar guess, treasure auction, picnic dash, fence fields, gem diggers, siege hills), keyed by room game name.

import { ROUNDS } from '../toy-box/common/party-royale/show-director.js';
import { createPartyServerHost } from '../toy-box/common/party-royale/party-server-host.js';
import { createSimServerHost } from '../toy-box/common/server-run/sim-server-host.js';
import { createPenguinSim } from '../toy-box/penguin-curling/penguin-sim.js';
import { createGolfSim } from '../toy-box/mini-golf-party/mini-golf-sim.js';
import { createCycleSim } from '../toy-box/light-cycle-arena/light-cycles-sim.js';
import { createLavaSim } from '../toy-box/lava-rise-climb/lava-sim.js';
import { createBuildServerHost } from '../toy-box/voxel-build-together/build-server-host.js';
import { createWaldoServerHost } from '../toy-box/wheres-waldo-game/waldo-server-host.js';
import { createTurnServerHost } from '../toy-box/common/server-run/turn-server-host.js';
import { createBankGame } from '../toy-box/bank-or-bust/bank-rules.js';
import { createLuckyGame } from '../toy-box/lucky-low/lucky-rules.js';
import { createJarGame } from '../toy-box/jar-guess/jar-rules.js';
import { createAuctionGame } from '../toy-box/treasure-auction/auction-rules.js';
import { createPicnicGame } from '../toy-box/picnic-dash/picnic-rules.js';
import { createFenceGame } from '../toy-box/fence-fields/fence-rules.js';
import { createGemGame } from '../toy-box/gem-diggers/gem-rules.js';
import { createSiegeGame } from '../toy-box/siege-hills/siege-rules.js';
import { createKartSim } from '../toy-box/kart-race-online/kart-sim.js';
import { createTurboSim } from '../toy-box/rocket-ball-soccer/turbo-sim.js';
import { createSumoSim } from '../toy-box/bumper-sumo-arena/sumo-sim.js';
import { createBombSim } from '../toy-box/bomb-tag-arena/bomb-sim.js';
import { createCrownSim } from '../toy-box/king-of-the-hill/crown-sim.js';
import { createChairsSim } from '../toy-box/musical-chairs-party/chairs-sim.js';
import { createBalloonSim } from '../toy-box/balloon-battle/balloon-sim.js';
import { createSheepdogSim } from '../toy-box/sheepdog-rush/sheepdog-sim.js';
import { createSnowballSim } from '../toy-box/snowball-fight-arena/snowball-sim.js';
import { createTankSim } from '../toy-box/tank-battle-maze/tank-sim.js';
import { createCannonSim } from '../toy-box/pirate-cannon-clash/cannon-sim.js';
import { createHexSim } from '../toy-box/hex-drop-survival/hex-sim.js';
import { createTurfSim } from '../toy-box/paint-territory/turf-sim.js';

const SHOW_GAME = 'bean-royale-show'; // party-game.js lobby name for the full show; single-round pages use the round id

export const hostedGames = {
  [SHOW_GAME]: (room) => createPartyServerHost(room, { show: true }),
  'kart-party': (room) => createSimServerHost(room, { createSim: createKartSim }),
  'turbo-ball': (room) => createSimServerHost(room, { createSim: createTurboSim }),
  'bumper-sumo': (room) => createSimServerHost(room, { createSim: createSumoSim }),
  'hot-potato': (room) => createSimServerHost(room, { createSim: createBombSim }),
  'crown-keep': (room) => createSimServerHost(room, { createSim: createCrownSim }),
  'chair-scramble': (room) => createSimServerHost(room, { createSim: createChairsSim }),
  'balloon-battle': (room) => createSimServerHost(room, { createSim: createBalloonSim }),
  'sheepdog-rush': (room) => createSimServerHost(room, { createSim: createSheepdogSim }),
  'snowball-brawl': (room) => createSimServerHost(room, { createSim: createSnowballSim }),
  'tank-brawl': (room) => createSimServerHost(room, { createSim: createTankSim }),
  'cannon-cove': (room) => createSimServerHost(room, { createSim: createCannonSim }),
  'hex-drop': (room) => createSimServerHost(room, { createSim: createHexSim }),
  'splat-turf': (room) => createSimServerHost(room, { createSim: createTurfSim }),
  'penguin-curling': (room) => createSimServerHost(room, { createSim: createPenguinSim }),
  'mini-golf': (room) => createSimServerHost(room, { createSim: createGolfSim }),
  'light-cycles': (room) => createSimServerHost(room, { createSim: createCycleSim }),
  'floor-is-lava': (room) => createSimServerHost(room, { createSim: createLavaSim }),
  'block-party': (room) => createBuildServerHost(room),
  'waldo-hunt': (room) => createWaldoServerHost(room),
  'bank-or-bust': (room) => createTurnServerHost(room, { createGame: createBankGame }),
  'lucky-low': (room) => createTurnServerHost(room, { createGame: createLuckyGame }),
  'jar-guess': (room) => createTurnServerHost(room, { createGame: createJarGame }),
  'treasure-auction': (room) => createTurnServerHost(room, { createGame: createAuctionGame }),
  'picnic-dash': (room) => createTurnServerHost(room, { createGame: createPicnicGame }),
  'fence-fields': (room) => createTurnServerHost(room, { createGame: createFenceGame }),
  'gem-diggers': (room) => createTurnServerHost(room, { createGame: createGemGame }),
  'siege-hills': (room) => createTurnServerHost(room, { createGame: createSiegeGame }),
  ...Object.fromEntries(Object.keys(ROUNDS).map((roundId) => [roundId, (room) => createPartyServerHost(room, { roundId })])),
};
