/**
 * @param {object} o
 * - @property {string} [name]
 * - @property {HTML element} element
 * - @property {number} [showZ] - z-index of menu when shown
 * - @property {number} [hideZ] - z-index of menu when hidden
 * - @property {array} [listenerSystems = []]
 * - @property {function} [startWork = function(){}]
 * - @property {function} [stopWork = function(){}]
 */
function Menu(o) {
	this.name = o.name || "unnamed";
	this.element = o.element;
	this.showZ = o.showZ || 1000;
	this.hideZ = o.hideZ || -1000;
	this.startWork = o.startWork || function(){};
	this.stopWork = o.stopWork || function(){};

	this.listenerSystems = o.listenerSystems || [];
	this.listenerSystemsActive = false;

	this.on = false;
	this.shown = false;
	this.element.style['z-index'] = this.hideZ;
	this.element.style.visibility = 'hidden';
}

Menu.prototype.show = function() {
	if (!this.shown) {
		this.element.style['z-index'] = this.showZ;
		this.element.style.visibility = 'visible';

		this.shown = true;
	}
};

Menu.prototype.hide = function() {
	if (this.shown) {
		this.element.style['z-index'] = this.hideZ;
		this.element.style.visibility = 'hidden';

		this.shown = false;
	}
};

Menu.prototype.start = function() {
	this.show();

	if (!this.on) {
		this.startListenerSystems();

		this.startWork();

		this.on = true;
	}
};

Menu.prototype.stop = function() {
	this.hide();

	if (this.on) {
		this.stopListenerSystems();

		this.stopWork();

		this.on = false;
	}
};

Menu.prototype.startListenerSystems = function() {
	if (!this.listenerSystemsActive) {
		var numLSs = this.listenerSystems.length;

		for (var i = 0; i < numLSs; ++i) {
			this.listenerSystems[i].start();
		}

		this.listenerSystemsActive = true;
	}
};

Menu.prototype.stopListenerSystems = function() {
	if (this.listenerSystemsActive) {
		var numLSs = this.listenerSystems.length;

		for (var i = 0; i < numLSs; ++i) {
			this.listenerSystems[i].stop();
		}

		this.listenerSystemsActive = false;
	}
};

export default Menu
