import ListenerSystem from './ListenerSystem';

/**
 * Track the state of keys (down/up)
 *
 * Do not change the target when `listening` is true
 * @param {DOM element} target - element to listen to for key events
 */
function Keyboard(target) {
	this.target = target;
	this.keydown = {};

	this.listening = false;

	this.keydownLS = new ListenerSystem(
		this.target,
		'keydown',
		this.handleKeydown.bind(this)
	);

	this.keyupLS = new ListenerSystem(
		this.target,
		'keyup',
		this.handleKeyup.bind(this)
	);
}

Keyboard.prototype.clear = function() {
	this.keydown = {};
};

Keyboard.getKeyID = function(e) {
	return e.keyCode;
};

Keyboard.prototype.handleKeydown = function(e) {
	var keyID = Keyboard.getKeyID(e);

	// console.log("keyID:", keyID);

	this.keydown[keyID] = true;
};

Keyboard.prototype.handleKeyup = function(e) {
	var keyID = Keyboard.getKeyID(e);

	this.keydown[keyID] = false;
};

Keyboard.prototype.start = function() {
	if (!this.listening) {
		this.keydownLS.start();
		this.keyupLS.start();

		this.listening = true;
	}
};

Keyboard.prototype.stop = function() {
	if (this.listening) {
		this.keydownLS.stop();
		this.keyupLS.stop();

		this.listening = false;
	}
};

export default Keyboard
