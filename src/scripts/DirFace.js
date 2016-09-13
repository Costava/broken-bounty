import Vector3 from './Vector3';
import Color from './Color';

/**
 * @param {object} o
 * - @property {array of Vector3} points
 * - @property {number} dir
 * - @property {object/Color} [color]
 */
function DirFace(o) {
	this.points = o.points;

	this.dir = o.dir;

	this.avgPoint = Vector3.average(this.points);

	this.color = o.color || Color.random(1);
}

export default DirFace
