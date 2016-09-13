import Vector2 from './Vector2';
import Cuboid from './Cuboid';

/**
 * @param {object} o
 * - @property {object/Rect} end
 * - @property {number} topZ
 * - @property {number} botZ
 * - @property {object/Vector2} [velocity]
 */
function Bullet(o) {
	this.cuboid = new Cuboid(o);

	this.velocity = o.velocity || Vector2.zero();
}

export default Bullet
