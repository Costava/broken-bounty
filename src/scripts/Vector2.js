import Rect from './Rect';

/**
 * Chainable Vector2 class
 * @param {number} x
 * @param {number} y
 */
function Vector2(x, y) {
	this.x = x;
	this.y = y;
}

Vector2.zero = function() {
	return new Vector2(0, 0);
};

Vector2.fromAngle = function(rads) {
	return new Vector2(
		Math.cos(rads), Math.sin(rads)
	);
};

/**
 * Return average point of the array of points
 */
Vector2.average = function(array) {
	var xTotal = 0;
	var yTotal = 0;

	var arrayLength = array.length;

	for (var i = 0; i < arrayLength; ++i) {
		xTotal += array[i].x;
		yTotal += array[i].y;
	}

	return new Vector2(
		xTotal / arrayLength,
		yTotal / arrayLength
	);
};

/**
 * @returns {object/Vector2}
 */
Vector2.prototype.clone = function() {
	return new Vector2(this.x, this.y);
};

Vector2.prototype.setMagnitude = function(newMag) {
	var oldMag = this.magnitude();

	this.x *= newMag / oldMag;
	this.y *= newMag / oldMag;

	return this;
};

/**
 * @param {object/Vector2} v
 * @returns {object/Vector2}
 */
Vector2.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;

	return this;
};

/**
 * @param {object/Vector2} v
 * @returns {object/Vector2}
 */
Vector2.prototype.subtract = function(v) {
	this.x -= v.x;
	this.y -= v.y;

	return this;
};

Vector2.prototype.scale = function(factor) {
	this.x *= factor;
	this.y *= factor;

	return this;
};

/**
 * Rotate around v by rads
 * @param {object/Vector2} v
 * @param {number} rads
 */
Vector2.prototype.rotate = function(v, rads) {
	var differenceVec = this.clone().subtract(v);
	var dVMag = differenceVec.magnitude();

	var oldAngle = differenceVec.angle();
	var newAngle = oldAngle + rads;

	var newDifferenceVec = Vector2.fromAngle(newAngle).setMagnitude(dVMag);

	this.x = v.x + newDifferenceVec.x;
	this.y = v.y + newDifferenceVec.y;

	return this;
};

/**
 * @returns {number}
 */
Vector2.prototype.magnitude = function() {
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

/**
 * @returns {number}
 */
Vector2.prototype.angle = function() {
	return Math.atan2(this.y, this.x);
};

Vector2.prototype.angleTo = function(v) {
	return v.clone().subtract(this).angle();
};

/**
 * @param {object/Vector2} v
 * @returns {number}
 */
Vector2.prototype.distance = function(v) {
	// Use a clone so that this is not changed
	return this.clone().subtract(v).magnitude();
};

/**
 * @param {object/Vector2} v
 * @returns {boolean}
 */
Vector2.prototype.equals = function(v) {
	return this.x == v.x && this.y == v.y;
};

/**
 * @param {object/Vector2} v
 * @returns {boolean}
 */
Vector2.prototype.lessThan = function(v) {
	return this.x < v.x && this.y < v.y;
};

/**
 * @param {object/Vector2} v
 * @returns {boolean}
 */
Vector2.prototype.lessThanOrEqualTo = function(v) {
	return this.x <= v.x && this.y <= v.y;
};

/**
 * @param {object/Vector2} v
 * @returns {boolean}
 */
Vector2.prototype.greaterThan = function(v) {
	return this.x > v.x && this.y > v.y;
};

/**
 * @param {object/Vector2} v
 * @returns {boolean}
 */
Vector2.prototype.greaterThanOrEqualTo = function(v) {
	return this.x >= v.x && this.y >= v.y;
};

/**
 * @param {object/Rect} r
 * @returns {boolean}
 */
Vector2.prototype.inside = function(r) {
	var relativeVec = this.clone().subtract(r.pos);

	return relativeVec.lessThan(r.dim) && relativeVec.greaterThan(Vector2.zero());
};

/**
 * @param {object/Rect} r
 * @returns {boolean}
 */
Vector2.prototype.on = function(r) {
	var relativeVec = this.clone().subtract(r.pos);

	return relativeVec.lessThanOrEqualTo(r.dim) && relativeVec.greaterThanOrEqualTo(Vector2.zero());
};

export default Vector2
