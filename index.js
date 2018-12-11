'use strict';

const blessed = require('neo-blessed');

const screen = blessed.screen({
  smartCSR: true
});

const numberOfFlakes = 100;
const flakeForms   = ['#', '*', '"', '.', '`']; // From large to small.
const flakeWeights = [5  , 4.5, 3, 3, 2];
const flakes = [];

for(let i = 0; i < numberOfFlakes; ++i) {

  const formIndex = parseInt(Math.random() * flakeForms.length);
  const top =  parseInt(Math.random() * screen.height);
  const left = parseInt(Math.random() * screen.width);
  const flakeEl = blessed.element({
    top,
    left,
    width: 1,
    height: 1,
    content: flakeForms[formIndex],
  });
  screen.append(flakeEl);
  const weight = flakeWeights[formIndex];
  const aero = (formIndex + 1)/flakeForms.length;
  flakes.push({ flakeEl, weight, aero, left, top });

}

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

let windForce = 0;
const maxWindForce = 12;
const windStep = 3;

const moveFlakes = () => {

  windForce = (windForce + windStep*(parseInt(Math.random()*3) - 1)) % maxWindForce;
  flakes.forEach((flake) => {

    const { left, top, weight, aero, flakeEl } = flake;
    flake.top = (top + 0.5*weight/flakeWeights.length + Math.random())
                % screen.height;
    flake.left =
      (screen.width + left + windForce/weight - 0.5 + Math.random())
      % screen.width;
    flakeEl.top  = Math.round(flake.top);
    flakeEl.left = Math.round(flake.left);
  });
  screen.render();
  
};

setInterval(moveFlakes, 100);
moveFlakes();
