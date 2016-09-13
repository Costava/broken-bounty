import Vector3 from './Vector3';
import Color from './Color';

/**
 * @param {array of Vector3} points
 * @param {object/Color} color
 */
function Face(points, color) {
	this.points = points;

	this.color = color || Color.random(1);

	this.update();
}

Face.prototype.update = function() {
	this.avgPoint = Vector3.average(this.points);
};

export default Face
