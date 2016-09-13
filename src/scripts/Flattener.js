import Vector2 from './Vector2';
import Vector3 from './Vector3';

/**
 * Get 2D points from 3D points
 * @param {object} o
 * - @property {number} [nearDistanceY]
 * - - how many units from center of screen to top or bottom at position of camera
 * - @property {number} [farDistanceY]
 * - - how many units from center of screen to top or bottom at end of viewDistance
 * - @property {number} [viewDistance]
 * - - how far can see
 * - @property {number} [fadeStartProp]
 * - - a [0, 1] proportion of viewDistance where stuff starts to become transparent
 * - @property {number} [aspectRatio]
 */
function Flattener(o) {
	this.nearDistance = new Vector2(
		0, o.nearDistanceY || Flattener.default.nearDistanceY
	);

	this.farDistance = new Vector2(
		0, o.farDistanceY || Flattener.default.farDistanceY
	);

	this.viewDistance = o.viewDistance || Flattener.default.viewDistance;

	// this.setFadeStartProp(o.fadeStartProp);

	var aR = o.aspectRatio || Flattener.default.aspectRatio;

	this.setAspectRatio(aR);
}

// Flattener.default = {
// 	nearDistanceY: 6,
// 	farDistanceY: 110,
// 	viewDistance: 100,
// 	fadeStartProp: 0.9,
// 	aspectRatio: 16 / 9
// };

// // def with e
// Flattener.default = {
// 	nearDistanceY: 10,
// 	farDistanceY: 40,
// 	viewDistance: 100,
// 	fadeStartProp: 0.9,
// 	aspectRatio: 16 / 9
// };

Flattener.default = {
	nearDistanceY: 0.1,
	farDistanceY: 40,
	viewDistance: 100,
	fadeStartProp: 0.9,
	aspectRatio: 16 / 9
};

// Flattener.prototype.setFadeStartProp = function(value) {
// 	this.fadeStartProp = value || Flattener.default.fadeStartProp;
//
// 	this.fadeStartDistance = this.fadeStartProp * this.viewDistance;
//
// 	this.fadeSectionDistance = this.viewDistance - this.fadeStartDistance;
// };

Flattener.prototype.setAspectRatio = function(value) {
	this.aspectRatio = value || Flattener.default.aspectRatio;

	this.nearDistance.x = this.nearDistance.y * this.aspectRatio;
	this.farDistance.x = this.farDistance.y * this.aspectRatio;

	this.distanceDiff = new Vector2(
		this.farDistance.x - this.nearDistance.x,
		this.farDistance.y - this.nearDistance.y
	);
};

/**
 * Get 2D coordinates (where (0, 0) is top left and (1, 1) is bottom right) of pos for cameraPos and cameraDir
 * @param {object/Vector3} cameraPos
 * @param {number/radians} cameraDir - direction camera is pointing
 * @param {object/Vector3} pos
 */
Flattener.prototype.get2D = function(cameraPos, cameraDir, pos) {
	var xyDistance = pos.distance2(cameraPos);

	var posDir = cameraPos.angleTo2(pos);

	// from cameraDir to pos
	var relativeAngle = Math.abs(posDir - cameraDir);

	var angleDiff = relativeAngle % (2 * Math.PI);

	// if (angleDiff > Math.PI) {
	// 	angleDiff = (2 * Math.PI) - angleDiff;
	// }
	//
	// if (angleDiff > Math.PI / 2) {
	// 	return undefined;
	// }

	var outDistance = xyDistance * Math.cos(relativeAngle);
	var sideDistance = xyDistance * Math.sin(relativeAngle);

	// var opacity;
	// if (outDistance >= this.viewDistance) {
	// 	return undefined;
	// }
	// else if (outDistance <= this.fadeStartDistance) {
	// 	opacity = 1;
	// }
	// else {
	// 	opacity = 1 - ((outDistance - this.fadeStartDistance) / this.fadeSectionDistance);
	// }

	var distance = {};

	if (outDistance >= 0) {
		distance.x = (outDistance / this.viewDistance) * this.distanceDiff.x + this.nearDistance.x;
		distance.y = (outDistance / this.viewDistance) * this.distanceDiff.y + this.nearDistance.y;
	}
	else {
		distance.x = (-outDistance / this.viewDistance) * this.distanceDiff.x + this.nearDistance.x;
		distance.y = (-outDistance / this.viewDistance) * this.distanceDiff.y + this.nearDistance.y;
	}

	// if (distance.y > 0) {
	// 	distance.y *= -1;
	// }

	var horizProp = Math.abs(sideDistance / distance.x);

	// console.log("horizProp:", horizProp);

	var cameraDirVector = new Vector2(Math.cos(cameraDir), Math.sin(cameraDir));
	var posDirVector = new Vector2(Math.cos(posDir), Math.sin(posDir));
	var crossZ = (cameraDirVector.x * posDirVector.y) - (cameraDirVector.y * posDirVector.x);

	// console.log("crossZ:", crossZ);

	var horizValue;
	if (crossZ > 0) {
		horizValue = 0.5 - 0.5 * horizProp;

		if (outDistance < 0) {
			horizValue -= 0.5;
		}
	}
	else if (crossZ < 0) {
		horizValue = 0.5 + 0.5 * horizProp;

		if (outDistance < 0) {
			horizValue += 0.5;
		}
	}
	else {
		horizValue = 0.5;

		// var angleDiff = Math.abs(cameraDir - posDir) % (2 * Math.PI);
		//
		// if (angleDiff > Math.PI) {
		// 	angleDiff = (2 * Math.PI) - angleDiff;
		// }

		// // Should check if it is in front and not behind
		// if (Math.abs(Math.atan2(Math.sin(cameraDir) / Math.cos(cameraDir)) - Math.atan2(Math.sin(posDir) / Math.cos(posDir))) < 0.1) {
		// 	horizValue = 0.5;
		// }
		// else {
		// 	// horizValue = 0.6;
		// 	return undefined;
		// }
	}

	var zDifference = cameraPos.z - pos.z;

	var vertValue = 0.5 * (zDifference / distance.y) + 0.5;

	if (outDistance < 0) {
		if (zDifference > 0) {
			vertValue += 0.5;
		}
		else {
			vertValue -= 0.5;
		}
	}

	// return {
	// 	x: horizValue,
	// 	y: vertValue,
	// 	opacity: opacity
	// };

	return new Vector2(horizValue, vertValue);
};

/**
 * Is point behind the pos when facing in dir
 * @param {object/Vector2} pos
 * @param {number} dir
 * @param {object/Vector2} points
 */
Flattener.allPointsBehind = function(pos, dir, points) {
	return points.every(function(point) {
		return Flattener.pointBehind(pos, dir, point);
	});
};

/**
 * Is point behind the pos when facing in dir
 * @param {object/Vector2} pos
 * @param {number} dir
 * @param {object/Vector2} point
 */
Flattener.pointBehind = function(pos, dir, point) {
	var angleDiff = Math.abs(dir - pos.angleTo2(point)) % (2 * Math.PI);

	if (angleDiff > Math.PI) {
		angleDiff = (2 * Math.PI) - angleDiff;
	}

	return angleDiff > Math.PI / 2;
};

Flattener.prototype.getPoints2D = function(cameraPos, cameraDir, points) {
	var points2D = [];

	var pointsLength = points.length;
	for (var i = 0; i < pointsLength; ++i) {
		var result = this.get2D(
			cameraPos,
			cameraDir,
			points[i]
		);

		if (result != undefined) {
			points2D.push(result);
		}
	}

	return points2D;
};

Flattener.prototype.fillShape = function(canvas, ctx, points2D, color) {
	if (points2D.length > 2) {
		ctx.save();
			ctx.scale(canvas.width, canvas.height);

			ctx.beginPath();
			ctx.moveTo(points2D[0].x, points2D[0].y);

			var points2DLength = points2D.length;
			for (var i = 1; i < points2DLength; ++i) {
				ctx.lineTo(points2D[i].x, points2D[i].y);
			}

			ctx.closePath();

			ctx.fillStyle = color;
			ctx.fill();
		ctx.restore();
	}
};

export default Flattener
