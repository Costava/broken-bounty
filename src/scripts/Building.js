import Cuboid from './Cuboid';
import Face from './Face';

function Building(o) {
	Cuboid.call(this, o)
}

Building.prototype = Object.create(Cuboid.prototype);

Building.prototype.generateFaces = function() {
	this.faces = {
		top: new Face([
			this.points[0], this.points[1], this.points[2], this.points[3]
		]),
		north: new Face([
				this.points[2], this.points[3], this.points[7], this.points[6]
		]),
		east: new Face([
				this.points[1], this.points[2], this.points[6], this.points[5]
		]),
		south: new Face([
				this.points[0], this.points[1], this.points[5], this.points[4]
		]),
		west: new Face([
				this.points[3], this.points[0], this.points[4], this.points[7]
		])
	};
};

export default Building
