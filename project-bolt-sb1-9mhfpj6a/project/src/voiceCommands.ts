import { Traits } from './CharacterRenderer';

export function parseVoiceCommand(transcript: string, current: Traits): { updated: Traits; feedback: string } {
  const cmd = transcript.toLowerCase();
  const next: Traits = { ...current };
  const changes: string[] = [];

  // 1. Species / Creature Commands
  if (cmd.includes('cat') || cmd.includes('feline')) { next.species = 'cat'; changes.push('Cat'); }
  else if (cmd.includes('bear') || cmd.includes('panda')) { next.species = 'bear'; changes.push('Bear'); }
  else if (cmd.includes('robot') || cmd.includes('bot')) { next.species = 'robot'; changes.push('Robot'); }
  else if (cmd.includes('alien') || cmd.includes('martian')) { next.species = 'alien'; changes.push('Alien'); }
  else if (cmd.includes('monster') || cmd.includes('vampire')) { next.species = 'monster'; changes.push('Monster'); }
  else if (cmd.includes('human') || cmd.includes('person') || cmd.includes('guy') || cmd.includes('girl')) {
    next.species = 'human';
    changes.push('Human');
  }

  // 2. Hair & Hat Commands
  if (cmd.includes('cowboy')) { next.hair = 'cowboyHat'; changes.push('Cowboy Hat'); }
  else if (cmd.includes('beanie')) { next.hair = 'beanie'; changes.push('Beanie'); }
  else if (cmd.includes('spiky')) { next.hair = 'spiky'; changes.push('Spiky Hair'); }
  else if (cmd.includes('long hair') || cmd.includes('waves')) { next.hair = 'longWaves'; changes.push('Long Waves'); }
  else if (cmd.includes('ponytail')) { next.hair = 'ponytail'; changes.push('Ponytail'); }
  else if (cmd.includes('buns')) { next.hair = 'buns'; changes.push('Space Buns'); }
  else if (cmd.includes('bob')) { next.hair = 'bob'; changes.push('Classic Bob'); }
  else if (cmd.includes('bald') || cmd.includes('no hair') || cmd.includes('take off the hat')) {
    next.hair = 'none';
    changes.push('No Hair/Hat');
  }

  // 3. Facial Hair Commands
  if (cmd.includes('full beard') || cmd.includes('beard')) { next.beard = 'full'; changes.push('Full Beard'); }
  else if (cmd.includes('goatee')) { next.beard = 'goatee'; changes.push('Goatee'); }
  else if (cmd.includes('mustache')) { next.beard = 'mustache'; changes.push('Mustache'); }
  else if (cmd.includes('stubble') || cmd.includes('shadow')) { next.beard = 'stubble'; changes.push('Stubble'); }
  else if (cmd.includes('shave') || cmd.includes('clean shaven')) { next.beard = 'none'; changes.push('Clean Shaven'); }

  // 4. Eyewear & Lashes Commands
  if (cmd.includes('sunglasses') || cmd.includes('shades')) { next.acc = 'sunglasses'; changes.push('Sunglasses'); }
  else if (cmd.includes('glasses')) { next.acc = 'glasses'; changes.push('Glasses'); }
  else if (cmd.includes('monocle')) { next.acc = 'monocle'; changes.push('Monocle'); }
  else if (cmd.includes('no glasses')) { next.acc = 'none'; changes.push('No Eyewear'); }

  if (cmd.includes('lashes') || cmd.includes('female') || cmd.includes('girl') || cmd.includes('woman')) {
    next.lashes = true;
    changes.push('Lashes ON');
  } else if (cmd.includes('no lashes') || cmd.includes('male') || cmd.includes('guy') || cmd.includes('man')) {
    next.lashes = false;
    changes.push('Lashes OFF');
  }

  // 5. Background & Color Commands
  if (cmd.includes('green screen') || cmd.includes('greenscreen')) { next.bg = 'greenscreen'; changes.push('Green Screen'); }
  else if (cmd.includes('neon') || cmd.includes('purple')) { next.bg = 'neon'; changes.push('Cyber Neon BG'); }
  else if (cmd.includes('sunset') || cmd.includes('yellow') || cmd.includes('orange') || cmd.includes('warm')) {
    next.bg = 'sunset';
    changes.push('Warm Sunset BG');
  } else if (cmd.includes('dark') || cmd.includes('black')) {
    next.bg = 'dark';
    changes.push('Dark Studio BG');
  }

  if (cmd.includes('green skin') || cmd.includes('make him green')) next.skin = '#4ade80';
  else if (cmd.includes('orange fur') || cmd.includes('make him orange')) next.skin = '#f97316';

  const feedback = changes.length
    ? `Applied: ${changes.join(', ')} ("${transcript}")`
    : `Heard "${transcript}" — try saying "cowboy hat", "cat", "full beard", or "green screen".`;

  return { updated: next, feedback };
}
