import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Rect from './Rect';
import Face from './Face';
import Barrel from './Barrel';

/**
 * @param {object} o
 * - @property {object/Vector3} [pos]
 * - @property {number} [dir]
 */
function Player(o) {
	this.pos = o.pos || Vector3.zero();
	this.dir = o.dir || 0;
}

export default Player
