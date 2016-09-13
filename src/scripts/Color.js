function Color(r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

Color.randomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Returns a random color object
 * @param {number} [alpha=1] - alpha value of color
 */
Color.random = function(alpha) {
	return new Color(
		Color.randomInt(0, 255),
		Color.randomInt(0, 255),
		Color.randomInt(0, 255),
		alpha || 1
	);
};

/**
 * @param {boolean} [includeA=true]
 */
Color.prototype.toString = function(includeA) {
	var withA = includeA || true;

	if (withA) {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}

	return `rgb(${this.r}, ${this.g}, ${this.b})`;
};

/**
 * @param {boolean} [invertA=false]
 */
Color.prototype.invert = function(invertA) {
	this.r = 255 - this.r;
	this.g = 255 - this.g;
	this.b = 255 - this.b;

	var invertAlpha = invertA || false;

	if (invertAlpha) {
		this.a = 1 - this.a;
	}
};

/**
 * @param {boolean} [invertA=false]
 */
Color.prototype.inverse = function(invertA) {
	var invA = invertA || false;

	if (invA) {
		return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1 - this.a);
	}

	return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
};

Color.prototype.clamp = function() {
	this.r = Math.max(Math.min(this.r, 255), 0);
	this.g = Math.max(Math.min(this.g, 255), 0);
	this.b = Math.max(Math.min(this.b, 255), 0);

	this.a = Math.max(Math.min(this.a, 1), 0);
};

/**
 * Scale the components of the color
 * @param {number} factor - to scale by
 * @param {boolean} [scaleA=false]
 */
Color.prototype.scale = function(factor, scaleA) {
	var doScaleA = scaleA || false;

	if (doScaleA) {
		this.a *= factor;
	}

	this.r *= factor;
	this.g *= factor;
	this.b *= factor;
};

Color.prototype.round = function() {
	this.r = Math.round(this.r);
	this.g = Math.round(this.g);
	this.b = Math.round(this.b);
};

Color.prototype.clone = function() {
	return new Color(this.r, this.g, this.b, this.a);
};

export default Color
