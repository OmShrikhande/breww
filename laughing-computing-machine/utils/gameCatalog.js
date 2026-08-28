/** Platform game IDs and default round options (least-bet-wins in auto mode). */
const GAME_OPTIONS = {
  colour: ['red', 'green', 'violet', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'big', 'small'],
  aviator: ['crash'],
  dice: [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
    'big', 'small', 'even', 'odd',
  ],
  'dragon-tiger': ['dragon', 'tiger', 'tie'],
  dragon: ['dragon', 'tiger', 'tie'],
  parity: ['even', 'odd'],
  wheel: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  'andar-bahar': ['andar', 'bahar'],
  plinko: ['0', '1', '2', '3', '4', '5', '6', '7'],
};

/** Breeww frontend slug → platform_games.id */
const PLAYER_GAME_SLUGS = {
  'color-prediction': 'colour',
  colour: 'colour',
  aviator: 'aviator',
  dice: 'dice',
  'dragon-tiger': 'dragon-tiger',
  dragon: 'dragon-tiger',
  'spin-wheel': 'wheel',
  wheel: 'wheel',
  plinko: 'plinko',
  mines: 'mines',
  poker: 'poker',
  roulette: 'roulette',
  'chamber-risk': 'chamber-risk',
  'andar-bahar': 'andar-bahar',
};

const PLATFORM_TO_PLAYER_PATH = {
  colour: '/game/color-prediction',
  aviator: '/game/aviator',
  dice: '/game/dice',
  'dragon-tiger': '/game/dragon-tiger',
  wheel: '/game/spin-wheel',
  plinko: '/game/plinko',
  mines: '/game/mines',
  poker: '/game/poker',
  roulette: '/game/roulette',
  'chamber-risk': '/game/chamber-risk',
  'andar-bahar': '/game/andar-bahar',
};

const ROUND_DRIVEN_GAMES = new Set([
  'colour', 'aviator', 'dice', 'dragon-tiger', 'dragon', 'parity', 'wheel', 'andar-bahar', 'plinko',
]);

function resolvePlatformGameId(slug) {
  return PLAYER_GAME_SLUGS[slug] || slug;
}

function pickAutoWinner(distribution, gameId) {
  const options = GAME_OPTIONS[gameId] || Object.keys(distribution);
  const totals = options.map((id) => ({
    id,
    total: Number(distribution[id] || 0),
  }));
  if (!totals.length) {
    const fallback = options[Math.floor(Math.random() * options.length)];
    return fallback;
  }
  const minTotal = Math.min(...totals.map((t) => t.total));
  const least = totals.filter((t) => t.total === minTotal);
  return least[Math.floor(Math.random() * least.length)].id;
}

module.exports = {
  GAME_OPTIONS,
  PLAYER_GAME_SLUGS,
  PLATFORM_TO_PLAYER_PATH,
  ROUND_DRIVEN_GAMES,
  resolvePlatformGameId,
  pickAutoWinner,
};
