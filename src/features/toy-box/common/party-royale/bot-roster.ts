// Names and colors bot beans that fill party royale seats, shared by browser and server hosts.

export const MAX_BEANS = 32;
const BOT_NAMES = ['Jelly', 'Wobbles', 'Squish', 'Hopper', 'Noodle', 'Gumdrop', 'Pip', 'Marsh', 'Boing', 'Taffy', 'Sprout', 'Fizz', 'Dumpling', 'Mochi', 'Pudding', 'Bloop', 'Sprinkle', 'Toffee', 'Nugget', 'Waffle', 'Bubbles', 'Pickle', 'Biscuit', 'Jujube', 'Peanut', 'Sherbet', 'Muffin', 'Tater', 'Wiggle', 'Dot', 'Zippy'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0', '#ffb703', '#8338ec', '#3a86ff', '#fb5607', '#ff006e', '#80ed99', '#c77dff', '#48cae4', '#f4a261', '#e9c46a', '#90be6d', '#43aa8b', '#f94144', '#4d908e', '#ffafcc', '#bde0fe', '#cdb4db'];
/** n bot seats with negative ids (relay ids are positive) */
export const botRoster = (n, idBase = -1) => Array.from({ length: n }, (_, i) => ({ id: idBase - i, nick: `${BOT_NAMES[i % BOT_NAMES.length]} 🤖`, color: BOT_COLORS[i % BOT_COLORS.length], bot: true }));
