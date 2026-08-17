const catalog = require('./catalog');

const VALID = {
  flavor: ['fruity', 'chocolatey', 'bold'],
  strength: ['light', 'medium', 'dark'],
  caffeine: ['regular', 'decaf']
};

const REASON_TEMPLATES = {
  flavor: {
    fruity: 'bright, fruity flavor',
    chocolatey: 'chocolatey, nutty flavor',
    bold: 'bold, smoky flavor'
  },
  strength: {
    light: 'light roast',
    medium: 'medium roast',
    dark: 'dark roast'
  }
};

function validateAnswers(answers) {
  if (!answers || typeof answers !== 'object') return false;
  return (
    VALID.flavor.includes(answers.flavor) &&
    VALID.strength.includes(answers.strength) &&
    VALID.caffeine.includes(answers.caffeine)
  );
}

function scoreProduct(product, answers) {
  let score = 0;
  if (product.caffeine === answers.caffeine) score += 4;
  if (product.flavor === answers.flavor) score += 3;
  if (product.strength === answers.strength) score += 2;
  return score;
}

function reasonFor(product, answers) {
  const bits = [];
  if (product.flavor === answers.flavor) bits.push(REASON_TEMPLATES.flavor[product.flavor]);
  if (product.strength === answers.strength) bits.push(REASON_TEMPLATES.strength[product.strength]);
  if (!bits.length) return 'Closest match to your taste in stock right now.';
  return 'Matches your preference for ' + bits.join(' and ') + '.';
}

function getMatches(answers, limit) {
  const top = limit || 3;
  return catalog
    .map((product) => ({ product, score: scoreProduct(product, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, top)
    .map(({ product }) => ({
      handle: product.handle,
      reason: reasonFor(product, answers)
    }));
}

module.exports = { validateAnswers, getMatches, VALID };
