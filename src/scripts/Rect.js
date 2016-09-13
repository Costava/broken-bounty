import Vector2 from './Vector2';

/**
 * @param {object/Vector2} pos - top left corner of rectangle
 * @param {object/Vector2} dim - dimensions of rectangle
 */
function Rect(pos, dim) {
	this.pos = pos;
	this.dim = dim;
}

/**
 * Returns the opposite corner to pos
 */
Rect.prototype.getOpposite = function() {
	return this.pos.clone().add(this.dim);
};

/**
 * @param {object/Rect} r
 * @returns {boolean}
 */
Rect.prototype.doesNotOverlap = function(r) {
	var vo1 = this.getOpposite();
	var vo2 = r.getOpposite();

	return (r.pos.x > vo1.x) || (vo2.x < this.pos.x) ||
		(r.pos.y > vo1.y) || (vo2.y < this.pos.y);
};

/**
 * @param {object/Rect} r
 * @returns {boolean}
 */
Rect.prototype.overlaps = function(r) {
	return !this.doesNotOverlap(r);
};

export default Rect
