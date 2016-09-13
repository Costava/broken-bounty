import Vector3 from './Vector3';
import Face from './Face';

/**
 * @param {object} o
 * - @property {object/Rect} end
 * - @property {number} topZ
 * - @property {number} botZ
 */
function Cuboid(o) {
	this.end = o.end;
	this.topZ = o.topZ;
	this.botZ = o.botZ;

	this.netAdjustments = 0;

	this.generatePoints();

	this.generateFaces();
}

Cuboid.prototype.generatePoints = function() {
	this.points = [];

	this.points.push(
		new Vector3(
			this.end.pos.x,
			this.end.pos.y,
			this.topZ
		),
		new Vector3(
			this.end.pos.x + this.end.dim.x,
			this.end.pos.y,
			this.topZ
		),
		new Vector3(
			this.end.pos.x + this.end.dim.x,
			this.end.pos.y + this.end.dim.y,
			this.topZ
		),
		new Vector3(
			this.end.pos.x,
			this.end.pos.y + this.end.dim.y,
			this.topZ
		)
	);

	for (var i = 0; i < 4; ++i) {
		var ref = this.points[i];

		this.points.push(new Vector3(
			ref.x, ref.y, this.botZ
		));
	}
};

Cuboid.prototype.generateFaces = function() {
	this.faces = {
		top: new Face([
			this.points[0], this.points[1], this.points[2], this.points[3]
		]),
		bot: new Face([
			this.points[4], this.points[5], this.points[6], this.points[7]
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

Cuboid.facePointIndexes = {
	top: [0, 1, 2, 3],
	bot: [4, 5, 6, 7],
	north: [2, 3, 7, 6],
	east: [1, 2, 6, 5],
	south: [0, 1, 5, 4],
	west: [3, 0, 4, 7]
};

Cuboid.prototype.getFacePoints = function(faceName) {
	var points = [];

	for (var i = 0; i < 4; ++i) {
		var index = Cuboid.facePointIndexes[faceName][i];

		points.push(this.points[index]);
	}

	return points;
};

Cuboid.prototype.updateFacePoints = function() {
	for (var prop in this.faces) {
		this.faces[prop].points = this.getFacePoints(prop);

		this.faces[prop].update();
	}
};

Cuboid.prototype.adjustDimensions = function(units) {
	this.netAdjustments += units;

	var halfUnits = units / 2;

	this.topZ += halfUnits;
	this.botZ -= halfUnits;

	this.end.pos.x -= halfUnits;
	this.end.pos.y -= halfUnits;

	this.end.dim.x += units;
	this.end.dim.y += units;
};

Cuboid.prototype.update = function() {
	this.generatePoints();

	this.updateFacePoints();
};

export default Cuboid
