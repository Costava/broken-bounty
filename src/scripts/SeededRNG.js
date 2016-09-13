/**
 * @param {number} [seed]
 */
function SeededRNG(seed) {
	this.seed = seed || 10;
}

/*
 * Returns value in [0, 1)
 */
SeededRNG.prototype.random = function() {
	this.seed += 1;

	var x = Math.sin(this.seed) * 100000;

	return x - Math.floor(x);
};

/**
 * Returns value in [min, max]
 */
SeededRNG.prototype.randomInt = function(min, max) {
	return Math.floor(this.random() * (max - min + 1)) + min;
};

/**
 * Returns value in [min, max)
 */
SeededRNG.prototype.randomInRange = function(min, max) {
	return this.random() * (max - min) + min;
}

export default SeededRNG
