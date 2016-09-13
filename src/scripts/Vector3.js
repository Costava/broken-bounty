import Vector2 from './Vector2';

/**
 * Chainable Vector3 class
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function Vector3(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector3.zero = function() {
	return new Vector3(0, 0, 0);
};

/**
 * Return average point of the array of points
 */
Vector3.average = function(array) {
	var xTotal = 0;
	var yTotal = 0;
	var zTotal = 0;

	var arrayLength = array.length;

	for (var i = 0; i < arrayLength; ++i) {
		xTotal += array[i].x;
		yTotal += array[i].y;
		zTotal += array[i].z;
	}

	return new Vector3(
		xTotal / arrayLength,
		yTotal / arrayLength,
		zTotal / arrayLength
	);
};

Vector3.prototype.clone = function() {
	return new Vector3(this.x, this.y, this.z);
};

Vector3.prototype.clone2 = function() {
	return new Vector2(this.x, this.y);
};

Vector3.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;

	return this;
};

Vector3.prototype.add2 = function(v) {
	this.x += v.x;
	this.y += v.y;

	return this;
};

Vector3.prototype.subtract = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;

	return this;
};

Vector3.prototype.subtract2 = function(v) {
	this.x -= v.x;
	this.y -= v.y;

	return this;
};

/**
 * Rotate around v by rads
 * @param {object/Vector2/3} v
 * @param {number} rads
 */
Vector3.prototype.rotateZ = function(v, rads) {
	var differenceVec = this.clone().subtract2(v);
	var dVMag = differenceVec.magnitude2();

	var newAngle = differenceVec.angle2() + rads;

	this.x = dVMag * Math.cos(newAngle);
	this.y = dVMag * Math.sin(newAngle);

	return this;
};

/**
 * @param {object/Vector3} v
 * @returns {number}
 */
Vector3.prototype.distance = function(v) {
	// Use a clone so that this is not changed
	return this.clone().subtract(v).magnitude();
};

Vector3.prototype.magnitude = function() {
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
};

/**
 * @returns {number}
 */
Vector3.prototype.magnitude2 = function() {
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

/*
 * Subtract x and y of v from this
 * @param {object/Vector} v
 */
Vector3.prototype.subtract2 = function(v) {
	this.x -= v.x;
	this.y -= v.y;

	return this;
};

Vector3.prototype.magnitude2 = function() {
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

Vector3.prototype.distance2 = function(v) {
	return this.clone().subtract2(v).magnitude2();
};

Vector3.prototype.angle2 = function() {
	return Math.atan2(this.y, this.x);
};

Vector3.prototype.angleTo2 = function(v) {
	return v.clone().subtract2(this).angle2();
};

export default Vector3
