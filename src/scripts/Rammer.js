import Vector2 from './Vector2';
import Cuboid from './Cuboid.js';

/**
 * @param {object} o
 * - @property {object/Rect} end
 * - @property {number} topZ
 * - @property {number} botZ
 * - @property {number} offsetMin
 * - @property {number} offsetMax
 * - @property {number} initialOffset
 * - @property {boolean} [offsetIncreasing]
 * - @property {number} [offsetSpeed]
 * - @property {number} [moveSpeed]
 */
function Rammer(o) {
	this.cuboid = new Cuboid(o);

	this.topZ = o.topZ;
	this.botZ = o.botZ;

	this.offsetMin = o.offsetMin;
	this.offsetMax = o.offsetMax;

	this.offset = o.initialOffset;
	this.offsetIncreasing = o.offsetIncreasing || true;

	this.offsetSpeed = o.offsetSpeed || 1;
	this.moveSpeed = o.moveSpeed || 1;
}

Rammer.prototype.oscillate = function() {
	if (this.offsetIncreasing) {
		this.offset += this.offsetSpeed;

		// Not perfect
		if (this.offset >= this.offsetMax) {
			this.offset -= this.offset - this.offsetMax;

			this.offsetIncreasing = false;
		}

		this.cuboid.topZ = this.topZ + this.offset;
		this.cuboid.botZ = this.botZ + this.offset;

		this.cuboid.update();
	}
	else {
		this.offset -= this.offsetSpeed;

		// Not perfect
		if (this.offset <= this.offsetMin) {
			this.offset += this.offsetMin - this.offset;

			this.offsetIncreasing = true;
		}

		this.cuboid.topZ = this.topZ + this.offset;
		this.cuboid.botZ = this.botZ + this.offset;

		this.cuboid.update();
	}
};

export default Rammer
