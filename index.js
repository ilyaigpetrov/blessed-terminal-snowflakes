'use strict';

const blessed = require('neo-blessed');

(async (global) => {

  const window = globalThis.window;
  const opts = window && await new Promise((resolve) => {
    window.onload = () => {

      // const TermJs = require('xterm');
      const TermJs = require('term.js');
      const Terminal = TermJs.Terminal;
      // const Terminal = Blessed.widget.terminal;
      const term = new Terminal({
          cols: 80,
          rows: 24,
          useStyle: true,
          screenKeys: true,
          // rendererType: 'dom', // Don't use canvas in xterm.
      });

      term.open(document.body);
      // term.write('\x1b[31mWelcome to term.js!\x1b[m\r\n');

      // glue to make Blessed work in browserify
      term.columns = term.cols;
      term.isTTY = true;

      term.resize(
        Math.floor(document.body.clientWidth / (document.querySelector('.terminal').clientWidth / 80)),
        Math.floor(document.body.clientHeight / (document.querySelector('.terminal').clientHeight / 24)),
      );
      resolve({ input: term, output: term, tput: false });

    };
  });

  const screen = blessed.screen({
    smartCSR: true,
    ...opts,
  });

  const area = screen.cols*screen.rows;
  const density = 0.03;

  const numberOfFlakes = area * density;
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

    return window ? window.location.reload() : process.exit(0);
  });

  let windForce = 0;
  const maxWindForce = 12; // 12 is mild.
  let windStep = 3;
  const capWindForce = () => {

    if (Math.abs(windForce) > maxWindForce) {
      windForce = maxWindForce*Math.sign(windForce);
    }
  }
  screen.key(['left'], function(ch, key) {

    windForce = (windForce - 1);
    capWindForce();
  });
  screen.key(['right'], function(ch, key) {

    windForce = (windForce + 1);
    capWindForce();
  });

  const moveFlakes = () => {

    windForce = windForce + windStep*(parseInt(Math.random()*3) - 1);
    capWindForce();
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

  let interval = 100;
  let timer;
  const updateTimer = () => {

    clearInterval(timer);
    timer = setInterval(moveFlakes, interval);
  }
  updateTimer();
  screen.key(['up'], function(ch, key) {

    interval -= 10;
    if (interval < 0) {
      interval = 0;
    }
    updateTimer();
  });
  screen.key(['down'], function(ch, key) {

    interval += 10;
    if (interval < 0) {
      interval = 0;
    }
    updateTimer();
  });
  moveFlakes();

})();
