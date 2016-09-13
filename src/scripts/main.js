console.log('Welcome');

//////////

import MaxChildSize from './MaxChildSize';
import ListenerSystem from './ListenerSystem';
import Timeout from './Timeout';
import Flattener from './Flattener';
import Color from './Color';
import Game from './Game';
import Keyboard from './Keyboard';
import Menu from './Menu';

//////////

var canvas = document.querySelector('.js-app-canvas');
var ctx = canvas.getContext('2d');

var keyboard = new Keyboard(window);
keyboard.start();

//////////

var game = new Game({
	canvas: canvas,
	ctx: ctx,
	keyboard: keyboard
});

game.dieCallback = function() {
	menus.end.start();
};

game.levelEndCallback = function() {
	menus.level.start();
};

//////////

var menus = {};

menus.main = new Menu({
	name: "main",
	element: document.querySelector('.js-main-menu'),
	listenerSystems: [
		new ListenerSystem(
			document.querySelector('.js-main-start'), 'click', function() {
				game.dualLooper.stopCallback = function() {
					menus.prepare.start();
				};

				menus.main.stop();
			}
		),
		new ListenerSystem(
			document.querySelector('.js-main-options'), 'click', function() {
				menus.main.stopListenerSystems();
				menus.main.hide();

				menus.options.start();
			}
		),
		new ListenerSystem(
			document, 'keydown', function(e) {
				var keyID = Keyboard.getKeyID(e);

				if (keyID == 37) {
					document.querySelector('.js-main-start').click();
				}
				else if (keyID == 39) {
					document.querySelector('.js-main-options').click();
				}
			}
		)
	],
	startWork: function() {
		game.prepMainMenu();
		game.start();
	},
	stopWork: function() {
		game.stop();
	}
});

menus.prepare = new Menu({
	name: "prepare",
	element: document.querySelector('.js-prepare-menu'),
	listenerSystems: [
		new ListenerSystem(
			document.querySelector('.js-prepare-start'), 'click', function() {
				game.dualLooper.stopCallback = function() {
					game.prepLevel(1);
					game.start();
				};

				menus.prepare.stop();
			}
		),
		new ListenerSystem(
			document, 'keydown', function(e) {
				var keyID = Keyboard.getKeyID(e);

				if (keyID == 40) {
					document.querySelector('.js-prepare-start').click();
				}
			}
		)
	],
	startWork: function() {
		game.prepPrepareMenu();
		game.start();
	},
	stopWork: function() {
		game.stop();
	}
});

menus.level = new Menu({
	name: "level",
	element: document.querySelector('.js-level-menu'),
	listenerSystems: [
		new ListenerSystem(
			document.querySelector('.js-next-level'), 'click', function() {
				game.prepLevel(game.level + 1);

				menus.level.stop();
			}
		),
		new ListenerSystem(
			document, 'keydown', function(e) {
				var keyID = Keyboard.getKeyID(e);

				if (keyID == 40) {
					document.querySelector('.js-next-level').click();
				}
			}
		)
	],
	startWork: function() {

	},
	stopWork: function() {
		game.start();
	}
});

menus.end = new Menu({
	name: "end",
	element: document.querySelector('.js-end-menu'),
	listenerSystems: [
		new ListenerSystem(
			document.querySelector('.js-end-again'), 'click', function() {
				game.prepLevel(1);

				menus.end.stop();

				game.start();
			}
		),
		new ListenerSystem(
			document.querySelector('.js-end-main'), 'click', function() {
				menus.end.stop();

				menus.main.start();
			}
		),
		new ListenerSystem(
			document, 'keydown', function(e) {
				var keyID = Keyboard.getKeyID(e);

				if (keyID == 37) {
					document.querySelector('.js-end-again').click();
				}
				else if (keyID == 39) {
					document.querySelector('.js-end-main').click();
				}
			}
		)
	],
	startWork: function() {

	},
	stopWork: function() {

	}
});

menus.options = new Menu({
	name: "options",
	element: document.querySelector('.js-options-menu'),
	listenerSystems: [
		new ListenerSystem(
			document.querySelector('.js-options-return'), 'click', function() {
				menus.options.stop();
			}
		),
		new ListenerSystem(
			document.querySelector('.js-turn-speed'), 'change', function() {
				var value = Number(this.value);

				game.playerTurnSpeed = value;

				console.log("Turn speed:", game.playerTurnSpeed);
			}
		),
		new ListenerSystem(
			document.querySelector('.js-turn-accel'), 'change', function() {
				var value = Number(this.value);

				game.playerTurnRateAccel = value;

				console.log("Turn acceleration:", game.playerTurnRateAccel);
			}
		),
		new ListenerSystem(
			document, 'keydown', function(e) {
				var keyID = Keyboard.getKeyID(e);

				if (keyID == 40) {
					document.querySelector('.js-options-return').click();
				}
			}
		)
	],
	startWork: function() {

	},
	stopWork: function() {
		menus.main.show();
		menus.main.startListenerSystems();
	}
});

//////////

menus.main.start();

//////////

function handleResize() {
	var canvas = document.querySelector('.js-app-canvas');
	var ctx = canvas.getContext('2d');

	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	game.flattener.setAspectRatio(game.canvas.width / game.canvas.height);

	game.draw();
}

var handleResizeTimeout = new Timeout(handleResize, 40);

var handleResizeLS = new ListenerSystem(
	window, 'resize', handleResizeTimeout.set.bind(handleResizeTimeout)
);

handleResizeLS.start();

// Initial run
handleResize();

//////////
