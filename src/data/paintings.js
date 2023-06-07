import earthlyDelights from '../assets/paintings/bosch-earthly-delights.jpg';
import lastJudgment from '../assets/paintings/bosch-the-last-judgment.jpeg';
import childrensGames from '../assets/paintings/bruegel-childrens-games.jpg';
import proverbs from '../assets/paintings/bruegel-netherlandish-proverbs.jpeg';
import angels from '../assets/paintings/bruegel-the-fall-of-the-rebel-angels.jpeg';

import thumbEarthlyDelights from '../assets/paintings/thumbnails/bosch-earthly-delights.jpg';
import thumbLastJudgment from '../assets/paintings/thumbnails/bosch-the-last-judgment.jpeg';
import thumbChildrensGames from '../assets/paintings/thumbnails/bruegel-childrens-games.jpg';
import thumbProverbs from '../assets/paintings/thumbnails/bruegel-netherlandish-proverbs.jpeg';
import thumbAngels from '../assets/paintings/thumbnails/bruegel-the-fall-of-the-rebel-angels.jpeg';

import acrobats from '../assets/paintings/targets/earthly-delights/acrobats.png';
import grapes from '../assets/paintings/targets/earthly-delights/grapes.png';
import owl from '../assets/paintings/targets/earthly-delights/owl.png';
import rest from '../assets/paintings/targets/earthly-delights/rest.png';

import bugman from '../assets/paintings/targets/final-judgment/bugman.png';
import salute from '../assets/paintings/targets/final-judgment/salute.png';
import unicornRider from '../assets/paintings/targets/final-judgment/unicorn-rider.png';
import wizard from '../assets/paintings/targets/final-judgment/wizard.png';

import boy from '../assets/paintings/targets/childrens-games/boy.png';
import doll from '../assets/paintings/targets/childrens-games/doll.png';
import girl from '../assets/paintings/targets/childrens-games/girl.png';

import egg from '../assets/paintings/targets/proverbs/egg.png';
import kissers from '../assets/paintings/targets/proverbs/kissers.png';
import treeman from '../assets/paintings/targets/proverbs/treeman.png';

import bird from '../assets/paintings/targets/angels/bird.png';
import freak from '../assets/paintings/targets/angels/freak.png';
import goron from '../assets/paintings/targets/angels/goron.png';
import redhead from '../assets/paintings/targets/angels/redhead.png';

const paintings = [
  {
    id: 'earthly-delights',
    artist: 'Hieronymus Bosch',
    title: 'The Garden of Earthly Delights',
    year: '1490 - 1510',
    type: 'Oil-on-wood triptych',
    location: 'Madrid, Spain',
    thumbnail: thumbEarthlyDelights,
    img: earthlyDelights,
    targets: [
      { dbName: 'acrobats', description: 'Acrobats', img: acrobats },
      {
        dbName: 'grapes',
        description: 'Three people enjoying grapes',
        img: grapes,
      },
      { dbName: 'owl', description: 'This particular owl', img: owl },
      { dbName: 'rest', description: 'Person resting', img: rest },
    ],
  },
  {
    id: 'final-judgment',
    artist: 'Hieronymus Bosch',
    title: 'The Last Judgment',
    year: 'c. 1486',
    type: 'Oil-on-wood triptych',
    location: 'Bruges, Belgium',
    thumbnail: thumbLastJudgment,
    img: lastJudgment,
    targets: [
      { dbName: 'bugman', description: 'Bug-like demon', img: bugman },
      { dbName: 'salute', description: 'Man saluting', img: salute },
      { dbName: 'unicorn', description: 'Unicorn rider', img: unicornRider },
      { dbName: 'wizard', description: 'Wizard', img: wizard },
    ],
  },
  {
    id: 'childrens-games',
    artist: 'Pieter Bruegel the Elder',
    title: "Children's Games",
    year: '1560',
    type: 'Oil on panel',
    location: 'Vienna, Austria',
    thumbnail: thumbChildrensGames,
    img: childrensGames,
    targets: [
      { dbName: 'boy', description: 'Active child', img: boy },
      { dbName: 'doll', description: 'Ominous figure', img: doll },
      { dbName: 'girl', description: 'Girl', img: girl },
    ],
  },
  {
    id: 'proverbs',
    artist: 'Pieter Bruegel the Elder',
    title: 'Netherlandish Proverbs',
    year: '1559',
    type: 'Oil on panel',
    location: 'Berlin, Germany',
    thumbnail: thumbProverbs,
    img: proverbs,
    targets: [
      { dbName: 'egg', description: 'Walking egg', img: egg },
      { dbName: 'kissing', description: 'Kissing folks', img: kissers },
      { dbName: 'treeman', description: 'Tree-like demon', img: treeman },
    ],
  },
  {
    id: 'angels',
    artist: 'Pieter Bruegel the Elder',
    title: 'The Fall of the Rebel Angels',
    year: '1562',
    type: 'Oil on panel',
    location: 'Brussels, Belgium',
    thumbnail: thumbAngels,
    img: angels,
    targets: [
      { dbName: 'bird', description: 'Bird', img: bird },
      { dbName: 'freak', description: 'Big mouth demon', img: freak },
      { dbName: 'goron', description: 'Goron', img: goron },
      { dbName: 'redhead', description: 'Redheaded woman', img: redhead },
    ],
  },
];

export function findAvatar(description) {
  const avatar = paintings
    .find((painting) =>
      painting.targets.some((target) => target.description === description)
    )
    .targets.find((item) => item.description === description).img;
  return avatar;
}

export function getPaintingInfo(paintingId) {
  return paintings.find((item) => item.id === paintingId);
}

export default paintings;
