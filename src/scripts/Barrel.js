import Cuboid from './Cuboid';
import Face from './Face';
import DirFace from './DirFace';

function Barrel(o) {
	Cuboid.call(this, o)
}

Barrel.prototype = Object.create(Cuboid.prototype);

Barrel.prototype.generateFaces = function() {
	this.faces = {
		east: new Face([
				this.points[1], this.points[2], this.points[6], this.points[5]
		]),
		west: new Face([
				this.points[3], this.points[0], this.points[4], this.points[7]
		]),
		south: new Face([
				this.points[0], this.points[1], this.points[5], this.points[4]
		]),
		top: new Face([
			this.points[0], this.points[1], this.points[2], this.points[3]
		])
	};
};

export default Barrel
