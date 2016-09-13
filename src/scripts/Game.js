import Flattener from './Flattener';
import DualLooper from './DualLooper';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Rect from './Rect';
import Cuboid from './Cuboid';
import Barrel from './Barrel';
import Building from './Building';
import Player from './Player';
import Color from './Color';
import SeededRNG from './SeededRNG';
import Bullet from './Bullet';
import Rammer from './Rammer';
import ScrollText from './ScrollText';
import Clamp from './Clamp';

/**
 * @param {canvas element} canvas
 * @param {2d canvas context} ctx
 * @param {object/Keyboard} keyboard
 */
function Game(o) {
	this.canvas = o.canvas;
	this.ctx = o.ctx;
	this.keyboard = o.keyboard;

	this.keyBinds = {
		moveForward: 87,
		moveBackward: 83,
		strafeRight: 68,
		strafeLeft: 65,
		turnRight: 39,
		turnLeft: 37,
		shoot: 32
	};

	this.newSRNG();

	this.flattener = new Flattener({
		aspectRatio: this.canvas.width / this.canvas.height
	});

	this.work = this.mainMenuWork;
	this.draw = this.mainMenuDraw;

	this.dualLooper = new DualLooper({
		regWork: this.work.bind(this),
		finalWork: this.draw.bind(this)
	});

	//////////

	this.shootInterval = 350;// Milliseconds
	this.lastShootTime = 0 - this.shootInterval;

	this.headLevel = 1.8;

	this.playerMoveSpeed = 0.4;
	this.playerTurnSpeed = 0.019;
	// this.playerFlySpeed = 0.35;

	this.playerTurnRate = 0;
	this.playerTurnRateAccel = 0.04;

	//////////

	// Length of barrel not including barrel end
	this.barrelLength = 1;
	this.barrelEndLength = 0.15;
	this.totalBarrelLength = this.barrelLength + this.barrelEndLength;

	this.barrel = new Barrel({
		end: new Rect(
			new Vector2(-0.1, 0),
			new Vector2(0.2, this.barrelLength)
		),
		topZ: 1.5,
		botZ: 1.3
	});

	this.barrelEnd = new Barrel({
		end: new Rect(
			new Vector2(-0.12, this.barrelLength),
			new Vector2(0.24, this.barrelEndLength)
		),
		topZ: 1.52,
		botZ: 1.28
	});

	this.barrelCameraShootY = 0.30;
	this.barrelCameraRestY = 0.01;

	this.barrelCameraPos = new Vector3(
		0, this.barrelCameraRestY, this.headLevel
	);

	this.barrelCameraDir = Math.PI / 2;

	this.bulletSideLength = 0.16;
	this.bulletHalfSideLength = this.bulletSideLength / 2;
	this.bulletTopZ = 1.48;
	this.bulletBotZ = 1.32;
	this.bulletDim = new Vector2(this.bulletSideLength, this.bulletSideLength);

	this.bulletSpeed = 2;

	this.bulletRemoveDistance = 200;

	this.bulletSmokeIncrease = 0.1;
	this.maxBulletSmokeAdjustment = 3;

	this.rammerDim = new Vector2(2.1, 2.1);
	this.rammerTopZ = 1.5;
	this.rammerBotZ = 0;
	this.rammerOffsetMin = 0;
	this.rammerOffsetMax = 0.5;
	this.rammerOffsetIncreasing = true;
	this.rammerOffsetSpeed = 0.02;
	this.rammerMoveSpeed = 0.34;

	this.edgeBuildingDim = new Vector2(10, 10);
	this.edgeBuildingBotZ = 0;
	this.edgeBuildingTopZ = 20;

	this.bullets = [];
	this.bulletSmokes = [];
	this.rammers = [];
	this.dyingRammers = [];

	this.rammerShrinkSpeed = 0.055;

	this.nearClippingDistance = 2;

	this.numInjuriesToDie = 3;

	this.dieCallback = function() {console.log("Die");};
	this.levelEndCallback = function() {console.log("Level end");};
}

Game.prototype.newSRNG = function() {
	var seed = Math.floor(new Date().getTime() * Math.random());

	// console.log("seed:", seed);

	this.srng = new SeededRNG(seed);
};

Game.getSurroundingPoints = function(rect, numPerSide) {
	var xSpacing = rect.dim.x / (numPerSide + 1);
	var ySpacing = rect.dim.y / (numPerSide + 1);

	var points = [];

	var refPoint = rect.pos;

	// South
	for (var i = 1; i < numPerSide + 1; ++i) {
		points.push(refPoint.clone().add(new Vector2(i * xSpacing, 0)));
	}

	// West
	for (var i = 1; i < numPerSide + 1; ++i) {
		points.push(refPoint.clone().add(new Vector2(0, i * ySpacing)));
	}

	refPoint = rect.pos.clone();
	refPoint.y += rect.dim.y;

	// North
	for (var i = 1; i < numPerSide + 1; ++i) {
		points.push(refPoint.clone().add(new Vector2(i * xSpacing, 0)));
	}

	refPoint = rect.pos.clone();
	refPoint.x += rect.dim.x;

	// East
	for (var i = 1; i < numPerSide + 1; ++i) {
		points.push(refPoint.clone().add(new Vector2(0, i * ySpacing)));
	}

	return points;
};

Game.prototype.damagePlayer = function() {
	this.levelStats.numInjuries += 1;

	this.overlay.a = 0.7;

	if (this.levelStats.numInjuries >= this.numInjuriesToDie) {
		this.killPlayer();
	}
};

Game.prototype.killPlayer = function() {
	if (!this.playerDead) {
		this.playerDead = true;

		this.dualLooper.stopCallback = function() {
			this.dyingRammers.forEach(function(rammer) {
				var playerDistance = rammer.cuboid.end.pos.distance(this.player.pos);

				if (playerDistance < 2.5) {
					this.dyingRammers.splice(this.dyingRammers.indexOf(rammer), 1);
				}
			}.bind(this));

			this.scrollTexts = [];

			document.querySelector('.js-final-balance').innerHTML = Game.getMoneyString(this.score);

			this.draw();

			this.dieCallback();
		}.bind(this);

		this.stop();
	}
};

Game.prototype.resetHurtOverlay = function() {
	this.overlay = new Color(250, 20, 22, 0);
};

Game.prototype.resetLevelEndOverlay = function() {
	this.overlay = new Color(50, 50, 50, 0);
};

Game.prototype.prepLevel = function(lvl) {
	this.level = lvl;

	this.levelEnding = false;

	if (this.level == 1) {
		this.score = 0;
	}

	this.resetHurtOverlay();

	this.levelStats = {
		rammersKilled: 0,
		shotsFired: 0,
		buildingHits: 0,
		numInjuries: 0
	};

	this.playerDead = false;

	this.newSRNG();

	this.lastShootTime = 0 - this.shootInterval;

	this.player = new Player({
		pos: new Vector3(-19, -19, this.headLevel),
		dir: Math.PI / 4
	});

	this.lastPlayerVelocity = Vector2.zero();

	this.playerTurnRate = 0;

	var r = this.srng.randomInt(55, 255);
	var g = this.srng.randomInt(55, 255);
	var b = this.srng.randomInt(55, 255);
	var a = 1;

	var barrelEndTopColor = new Color(r, g, b, a);
	var barrelEndSouthColor = barrelEndTopColor.clone();
	var barrelTopColor = barrelEndTopColor.clone();

	barrelEndSouthColor.scale(0.6, false);
	barrelEndSouthColor.round();

	barrelTopColor.scale(0.8, false);
	barrelTopColor.round();

	this.barrelEnd.faces.top.color = barrelEndTopColor;
	this.barrelEnd.faces.south.color = barrelEndSouthColor;
	this.barrel.faces.top.color = barrelTopColor;

	this.bullets = [];

	this.bulletSmokes = [];

	this.rammers = [];
	this.dyingRammers = [];

	this.edgeBuildings = [];

	this.walls = [];

	this.scrollTexts = [];

	// Num of buildings in each row and column
	var citySize = 3 + 2 * this.level;

	if (citySize > 9) {
		citySize = 9;
	}

	this.buildingSpreadMin = 37;
	this.buildingSpreadMax = 39;

	this.borderRect = new Rect(
		new Vector2(-30, -30),
		new Vector2((citySize - 1) * this.buildingSpreadMax + 60, (citySize - 1) * this.buildingSpreadMax + 60)
	);

	this.areaRect = new Rect(
		this.borderRect.pos.clone().add(this.edgeBuildingDim),
		this.borderRect.dim.clone().subtract(this.edgeBuildingDim)
	);

	this.surroundingPoints = Game.getSurroundingPoints(this.borderRect, 8);

	this.surroundingPoints.forEach(function(point) {
		var building = new Building({
			end: new Rect(
				point.clone(),
				this.edgeBuildingDim.clone()
			),
			topZ: this.edgeBuildingTopZ,
			botZ: this.edgeBuildingBotZ
		});

		this.edgeBuildings.push(building);
	}.bind(this));

	for (var x = 0; x < citySize; ++x) {
		for (var y = 0; y < citySize; ++y) {
			this.walls.push(new Building({
				end: new Rect(
					new Vector2(x * this.srng.randomInt(this.buildingSpreadMin, this.buildingSpreadMax), y * this.srng.randomInt(this.buildingSpreadMin, this.buildingSpreadMax)),
					new Vector2(this.srng.randomInt(10, 12), this.srng.randomInt(10, 12))
				),
				topZ: this.srng.randomInt(2, 20),
				botZ: 0
			}));
		}
	}

	var numRammers = 4 + 2 * this.level;

	if (numRammers > 35) {
		numRammers = 35;
	}

	for (var n = 0; n < numRammers; ++n) {
		var x = this.srng.randomInt(0 * this.buildingSpreadMax, citySize * this.buildingSpreadMax);
		var y = this.srng.randomInt(0 * this.buildingSpreadMax, citySize * this.buildingSpreadMax);

		var newPos = new Vector2(x, y);

		var collision = true;

		while (collision) {
			collision = this.walls.some(function(wall) {
				return newPos.on(wall.end);
			});

			if (collision) {
				newPos.y += 1;
			}
		}

		this.addRammer(newPos);
	}

	this.work = this.gameWork;
	this.draw = this.gameDraw;

	this.dualLooper.regWork = this.work.bind(this);
	this.dualLooper.finalWork = this.draw.bind(this);

	console.log("Generated city", this.level);
};

Game.prototype.notifyRemainingRobots = function() {
	// Remove the latest scroll text if it is close enough to overlap the next scroll text
	if (this.scrollTexts.length > 0) {
		var latestScrollText = this.scrollTexts[this.scrollTexts.length - 1];

		var pixelDisplacement = latestScrollText.progress * (latestScrollText.textMetrics.width + latestScrollText.canvas.width);

		var selfDisplacements = pixelDisplacement / latestScrollText.textMetrics.width;

		if (selfDisplacements < 1.2) {
			this.scrollTexts.pop();
		}
	}

	var plural;
	if (this.rammers.length == 1) {
		plural = "";
	}
	else {
		// 's' needed for 0 -> 0 robots remaining
		plural = "s";
	}

	// Add the new scroll text
	this.scrollTexts.push(new ScrollText({
		text: `${this.rammers.length} robot${plural} remaining`,
		canvas: this.canvas,
		ctx: this.ctx
	}));
};

Game.prototype.start = function() {
	this.dualLooper.resetTime();
	this.dualLooper.start();
};

Game.prototype.stop = function() {
	this.dualLooper.stop();
};

Game.prototype.resume = function() {
	this.dualLooper.start();
};

Game.prototype.pause = function() {
	this.dualLooper.stop();
};

Game.prototype.prepMainMenu = function() {
	this.newSRNG();

	this.player = new Player({
		pos: new Vector3(0, -5, this.headLevel),
		dir: Math.PI / 2
	});

	this.mainMenuBuildings = [];

	for (var x = 0; x < 7; ++x) {
		for (var y = 0; y < 7; ++y) {
			this.mainMenuBuildings.push(new Building({
				end: new Rect(
					new Vector2(x * this.srng.randomInt(32, 34), y * this.srng.randomInt(32, 34)),
					new Vector2(this.srng.randomInt(10, 12), this.srng.randomInt(10, 12))
				),
				topZ: this.srng.randomInt(1, 24),
				botZ: 0
			}));
		}
	}

	// Get list of all building points
	this.mainMenuBuildingPoints = [];

	var numBuildings = this.mainMenuBuildings.length;
	for (var i = 0; i < numBuildings; ++i) {
		var numPoints = this.mainMenuBuildings[i].points.length;

		for (var j = 0; j < numPoints; ++j) {
			this.mainMenuBuildingPoints.push(this.mainMenuBuildings[i].points[j]);
		}
	}

	this.mainMenuAvgPoint = Vector3.average(this.mainMenuBuildingPoints);

	this.mainMenuAvgDist = 0;
	this.mainMenuAvgHeight = 0;

	var numBuildingPoints = this.mainMenuBuildingPoints.length;

	for (var i = 0; i < numBuildingPoints; ++i) {
		var currentPoint = this.mainMenuBuildingPoints[i];

		this.mainMenuAvgDist += this.mainMenuAvgPoint.distance2(currentPoint);

		this.mainMenuAvgHeight += currentPoint.z;
	}

	this.mainMenuAvgDist /= numBuildingPoints;
	this.mainMenuAvgHeight /= numBuildingPoints;

	this.player.pos.z = this.mainMenuAvgHeight * 6;

	this.mainMenuCameraDist = this.mainMenuAvgDist * 2;

	this.mainMenuAngle = 0;

	this.work = this.mainMenuWork;
	this.draw = this.mainMenuDraw;

	this.dualLooper.regWork = this.work.bind(this);
	this.dualLooper.finalWork = this.draw.bind(this);
};

Game.prototype.prepPrepareMenu = function() {
	this.work = this.prepareMenuWork;
	this.draw = this.mainMenuDraw;

	this.dualLooper.regWork = this.work.bind(this);
	this.dualLooper.finalWork = this.draw.bind(this);
};

// The work for the prepare menu
Game.prototype.prepareMenuWork = function() {
	this.mainMenuAngle += 0.001;

	this.mainMenuAngle %= Math.PI * 2;

	var radius = Math.sin(2 * this.mainMenuAngle) + Math.cos(4 * this.mainMenuAngle);
	radius = Math.abs(radius);
	radius *= this.mainMenuCameraDist;

	var newX = this.mainMenuAvgPoint.x + Math.cos(this.mainMenuAngle) * radius;
	var newY = this.mainMenuAvgPoint.y + Math.sin(this.mainMenuAngle) * radius;

	// this.player.pos.x = newX;
	// this.player.pos.y = newY;

	var proportion = 0.005;

	this.player.pos.x += (newX - this.player.pos.x) * proportion;
	this.player.pos.y += (newY - this.player.pos.y) * proportion;

	this.player.dir = this.mainMenuAngle + Math.PI;

	return true;
};

Game.prototype.mainMenuWork = function() {
	this.mainMenuAngle += 0.001;

	this.mainMenuAngle %= Math.PI * 2;

	var newX = this.mainMenuAvgPoint.x + Math.cos(this.mainMenuAngle) * this.mainMenuCameraDist;
	var newY = this.mainMenuAvgPoint.y + Math.sin(this.mainMenuAngle) * this.mainMenuCameraDist;

	this.player.pos.x = newX;
	this.player.pos.y = newY;

	this.player.dir = this.mainMenuAngle + Math.PI;

	return true;
};

Game.prototype.mainMenuDraw = function() {
	this.ctx.save();
		this.ctx.scale(this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = '#7EC0EE';
		this.ctx.fillRect(0, 0, 1, 0.5);
		this.ctx.fillStyle = '#4DBD33';
		this.ctx.fillRect(0, 0.5, 1, 0.5);
	this.ctx.restore();

	//////////

	this.clearFaces();

	var numWalls = this.mainMenuBuildings.length;
	for (var i = 0; i < numWalls; ++i) {
		this.addCuboidishFaces(this.mainMenuBuildings[i]);
	}

	var numFaces = this.faces.length;
	for (var i = 0; i < numFaces; ++i) {
		this.flattener.fillShape(
			this.canvas, this.ctx,
			this.flattener.getPoints2D(
				this.player.pos, this.player.dir, this.faces[i].points
			),
			this.faces[i].color.toString(true)
		)
	}
};

Game.getSignedMoneyString = function(num) {
	var sign;
	if (num < 0) {
		sign = '-';
	}
	else {
		sign = '+';
	}

	return sign + '€' + String(Math.abs(num));
};

Game.getMoneyString = function(num) {
	var sign;
	if (num < 0) {
		sign = '-';
	}
	else {
		sign = '';
	}

	return sign + '€' + String(Math.abs(num));
};

Game.prototype.endLevel = function() {
	this.rammerKillMoney = 110;
	this.firedShotMoney = -10;
	this.damageBuildingMoney = -20;
	this.injuryMoney = -110;

	this.dualLooper.stopCallback = function() {
		document.querySelector('.js-robots-killed').innerHTML = this.levelStats.rammersKilled;
		var newRammerKillMoney = this.levelStats.rammersKilled * this.rammerKillMoney;
		document.querySelector('.js-robots-killed-money').innerHTML = Game.getSignedMoneyString(newRammerKillMoney);
		this.score += newRammerKillMoney;

		document.querySelector('.js-shots-fired').innerHTML = this.levelStats.shotsFired;
		var newShotsFiredMoney = this.levelStats.shotsFired * this.firedShotMoney;
		document.querySelector('.js-shots-fired-money').innerHTML = Game.getSignedMoneyString(newShotsFiredMoney);
		this.score += newShotsFiredMoney;

		document.querySelector('.js-building-damage').innerHTML = this.levelStats.buildingHits;
		var newBuildingDamageMoney = this.levelStats.buildingHits * this.damageBuildingMoney;

		var bdText;
		if (newBuildingDamageMoney == 0) {
			bdText = '-€0';
		}
		else {
			bdText = Game.getSignedMoneyString(newBuildingDamageMoney)
		}

		document.querySelector('.js-building-damage-money').innerHTML = bdText;
		this.score += newBuildingDamageMoney;

		document.querySelector('.js-injuries').innerHTML = this.levelStats.numInjuries;
		var newInjuriesMoney = this.levelStats.numInjuries * this.injuryMoney;

		var injText;
		if (newInjuriesMoney == 0) {
			injText = '-€0';
		}
		else {
			injText = Game.getSignedMoneyString(newInjuriesMoney);
		}

		document.querySelector('.js-injuries-money').innerHTML = injText;
		this.score += newInjuriesMoney;

		document.querySelector('.js-current-balance').innerHTML = Game.getMoneyString(this.score);

		this.levelEndCallback();
	}.bind(this);

	this.stop();
};

Game.prototype.rammerDeath = function() {
	if (this.levelStats.numInjuries >= this.numInjuriesToDie) {
		this.killPlayer();
	}
	else if (this.rammers.length == 0) {
		this.resetLevelEndOverlay();
		this.levelEnding = true;

		console.log(`City ${this.level} cleared!`);
	}
	else {
		this.notifyRemainingRobots();
	}
};

Game.prototype.gameWork = function() {
	this.scrollTexts.forEach(function(scrollText) {
		scrollText.move();

		if (scrollText.doneMoving) {
			this.scrollTexts.splice(this.scrollTexts.indexOf(scrollText), 1);
		}
	}.bind(this));

	if (this.levelEnding) {
		this.overlay.a += 0.003;

		if (this.overlay.a > 0.6) {
			this.endLevel();
		}
	}
	else {
		this.overlay.a -= 0.004;

		if (this.overlay.a < 0) {
			this.overlay.a = 0;
		}
	}

	var turn = 0;

	if (this.keyboard.keydown[this.keyBinds.turnRight]) {
		// this.player.dir -= this.playerTurnSpeed;

		turn -= 1;
	}
	if (this.keyboard.keydown[this.keyBinds.turnLeft]) {
		// this.player.dir += this.playerTurnSpeed;

		turn += 1;
	}

	if (turn != 0) {
		this.playerTurnRate += this.playerTurnRateAccel;

		this.playerTurnRate = Clamp(this.playerTurnRate, 0, 1);

		this.player.dir += turn * this.playerTurnRate * this.playerTurnSpeed;
	}
	else {
		this.playerTurnRate -= this.playerTurnRateAccel;

		this.playerTurnRate = Clamp(this.playerTurnRate, 0, 1);
	}

	var inputVector = Vector2.zero();

	if (this.keyboard.keydown[this.keyBinds.moveForward]) {
		inputVector.x += 1;
	}
	if (this.keyboard.keydown[this.keyBinds.moveBackward]) {
		inputVector.x -= 1;
	}
	if (this.keyboard.keydown[this.keyBinds.strafeRight]) {
		inputVector.y -= 1;
	}
	if (this.keyboard.keydown[this.keyBinds.strafeLeft]) {
		inputVector.y += 1;
	}

	if (inputVector.magnitude() > 0) {
		// What to add to the old position to get the new position
		var newPosDiff = inputVector.clone().setMagnitude(this.playerMoveSpeed);
		newPosDiff.rotate(Vector2.zero(), this.player.dir);

		var newPos = newPosDiff.clone().add(this.player.pos);

		var collision = this.walls.some(function(wall) {
			return newPos.on(wall.end);
		}) || !newPos.on(this.areaRect);

		if (!collision) {
			this.player.pos.x = newPos.x;
			this.player.pos.y = newPos.y;

			this.lastPlayerVelocity = newPosDiff;
		}
		else {
			this.lastPlayerVelocity = Vector2.zero();
		}
	}
	else {
		this.lastPlayerVelocity = Vector2.zero();
	}

	// if (this.keyboard.keydown[this.keyBinds.jump]) {
	// 	this.player.pos.z += this.playerFlySpeed;
	// }
	// else {
	// 	this.player.pos.z -= this.playerFlySpeed;
	// }
	//
	// if (this.player.pos.z < this.headLevel) {
	// 	this.player.pos.z = this.headLevel;
	// }

	this.barrelCameraPos.y += (this.barrelCameraRestY - this.barrelCameraPos.y) * 0.038;

	this.bullets.forEach(function(bullet) {
		bullet.cuboid.end.pos.add(bullet.velocity);

		var roughBulletPlayerDistance = this.player.pos.distance2(bullet.cuboid.end.pos);

		var tooFarAway = roughBulletPlayerDistance > this.bulletRemoveDistance;

		if (tooFarAway) {
			this.bullets.splice(this.bullets.indexOf(bullet), 1);
		}
		else {
			var hitRammer;
			var hitEnemy = this.rammers.some(function(rammer) {
				hitRammer = rammer;

				return rammer.cuboid.end.overlaps(bullet.cuboid.end);
			}.bind(this));

			if (hitEnemy) {
				this.bulletToSmoke(bullet);

				this.killRammer(hitRammer);

				console.log("Number of robots left:", this.rammers.length);

				this.rammerDeath();
			}
			else {
				var hitWall = this.walls.some(function(wall) {
					return wall.end.overlaps(bullet.cuboid.end);
				});

				if (hitWall) {
					this.levelStats.buildingHits += 1;

					this.bulletToSmoke(bullet);
				}
				else {
					bullet.cuboid.update();
				}
			}
		}
	}.bind(this));

	if (this.keyboard.keydown[this.keyBinds.shoot]) {
		this.shoot();
	}

	this.bulletSmokes.forEach(function(bulletSmoke) {
		bulletSmoke.cuboid.adjustDimensions(this.bulletSmokeIncrease);

		if (bulletSmoke.cuboid.netAdjustments > this.maxBulletSmokeAdjustment) {
			this.bulletSmokes.splice(this.bulletSmokes.indexOf(bulletSmoke), 1);
		}
		else {
			bulletSmoke.cuboid.update();
		}
	}.bind(this));

	this.rammers.forEach(function(rammer) {
		var hitPlayer = this.player.pos.clone2().inside(rammer.cuboid.end);

		if (hitPlayer) {
			this.damagePlayer();

			this.dieRammer(rammer);

			this.rammerDeath();
		}
		else {
			var toPlayer = this.player.pos.clone2().subtract(rammer.cuboid.end.dim.clone().scale(0.5)).subtract(rammer.cuboid.end.pos).setMagnitude(rammer.moveSpeed);

			var newPos = rammer.cuboid.end.pos.clone().add(toPlayer);

			var collision = this.walls.some(function(wall) {
				return newPos.on(wall.end);
			});

			if (!collision) {
				rammer.cuboid.end.pos = newPos;
			}

			rammer.oscillate();
		}
	}.bind(this));

	this.dyingRammers.forEach(function(rammer) {
		rammer.cuboid.adjustDimensions(-this.rammerShrinkSpeed);

		if (rammer.cuboid.topZ < rammer.cuboid.botZ) {
			this.dyingRammers.splice(this.dyingRammers.indexOf(rammer), 1);
		}
		else {
			rammer.cuboid.update();
		}
	}.bind(this));

	return true;
};

Game.prototype.gameDraw = function() {
	// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	this.ctx.save();
		this.ctx.scale(this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = '#7EC0EE';
		this.ctx.fillRect(0, 0, 1, 0.5);
		this.ctx.fillStyle = '#4DBD33';
		this.ctx.fillRect(0, 0.5, 1, 0.5);
	this.ctx.restore();

	//////////

	this.clearFaces();

	var numWalls = this.walls.length;
	for (var i = 0; i < numWalls; ++i) {
		this.addCuboidishFaces(this.walls[i]);
	}

	var numEdgeBuildings = this.edgeBuildings.length;
	for (var i = 0; i < numEdgeBuildings; ++i) {
		this.addCuboidishFaces(this.edgeBuildings[i]);
	}

	var numBullets = this.bullets.length;
	for (var i = 0; i < numBullets; ++i) {
		this.addCuboidishFaces(this.bullets[i].cuboid);
	}

	var numBulletSmokes = this.bulletSmokes.length;
	for (var i = 0; i < numBulletSmokes; ++i) {
		this.addCuboidishFaces(this.bulletSmokes[i].cuboid);
	}

	var numRammers = this.rammers.length;
	for (var i = 0; i < numRammers; ++i) {
		this.addCuboidishFaces(this.rammers[i].cuboid);
	}

	var numDyingRammers = this.dyingRammers.length;
	for (var i = 0; i < numDyingRammers; ++i) {
		this.addCuboidishFaces(this.dyingRammers[i].cuboid);
	}

	var numFaces = this.faces.length;
	for (var i = 0; i < numFaces; ++i) {
		this.drawFace(this.faces[i]);
	}

	for (var prop in this.barrelEnd.faces) {
		this.flattener.fillShape(
			this.canvas, this.ctx,
			this.flattener.getPoints2D(
				this.barrelCameraPos, this.barrelCameraDir, this.barrelEnd.faces[prop].points
			),
			this.barrelEnd.faces[prop].color.toString(true)
		);
	}

	for (var prop in this.barrel.faces) {
		this.flattener.fillShape(
			this.canvas, this.ctx,
			this.flattener.getPoints2D(
				this.barrelCameraPos, this.barrelCameraDir, this.barrel.faces[prop].points
			),
			this.barrel.faces[prop].color.toString(true)
		);
	}

	this.scrollTexts.forEach(function(scrollText) {
		scrollText.draw();
	});

	this.ctx.save();
		this.ctx.scale(this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = this.overlay.toString();
		this.ctx.fillRect(0, 0, 1, 1);
	this.ctx.restore();

	/* * /
	// Debug info

	var fontSize = 12;
	var fontMargin = 4;

	var debugItems = [];

	debugItems.push({
		label: "this.player.pos",
		value: `${this.player.pos.x.toFixed(4)} ${this.player.pos.y.toFixed(4)}`
	});

	debugItems.push({
		label: "this.player.dir",
		value: `${(this.player.dir / Math.PI * 180 % 360).toFixed(4)} degrees (${this.player.dir.toFixed(4)})`
	});

	debugItems.push({
		label: "this.bullets.length",
		value: `${this.bullets.length}`
	});

	debugItems.push({
		label: "this.bulletSmokes.length",
		value: `${this.bulletSmokes.length}`
	});

	debugItems.push({
		label: "this.scrollTexts.length",
		value: `${this.scrollTexts.length}`
	});

	this.ctx.save();
		this.ctx.font = `${fontSize}px Arial`;
		this.ctx.textBaseline = 'bottom';

		for (var i = 0; i < debugItems.length; ++i) {
			var tx = fontMargin;
			var ty = this.canvas.height - ((i + 1) * fontMargin) - (i * fontSize);

			this.ctx.fillText(`${debugItems[i].label}: ${debugItems[i].value}`, tx, ty);
		}
	this.ctx.restore();

	/* */
};

Game.prototype.drawFace = function(face) {
	this.flattener.fillShape(
		this.canvas, this.ctx,
		this.flattener.getPoints2D(
			this.player.pos, this.player.dir, face.points
		),
		face.color.toString(true)
	);
};

Game.prototype.clearFaces = function() {
	this.faces = [];
};

/**
 * @param {object/Face} face
 * - @property {number} avgPointPlayerDist
 */
Game.prototype.insertFace = function(face) {
	var placed = false;

	for (var i = 0; i < this.faces.length; ++i) {
		if (face.avgPointPlayerDist > this.faces[i].avgPointPlayerDist) {
			this.faces.splice(i, 0, face);

			placed = true;

			break;
		}
	}

	if (!placed) {
		this.faces.push(face);
	}
};

Game.prototype.faceNotVisible = function(face) {
	return Flattener.allPointsBehind(
		this.player.pos,
		this.player.dir,
		face.points
	);
};

Game.prototype.addFace = function(face) {
	var notInView = this.faceNotVisible(face);

	if (!notInView) {
		face.avgPointPlayerDist = face.avgPoint.distance(this.player.pos);

		this.insertFace(face);
	}
};

Game.prototype.addCuboidishFaces = function(cuboidish) {
	for (var prop in cuboidish.faces) {
		this.addFace(cuboidish.faces[prop]);
	}
};

Game.prototype.shoot = function() {
	if (this.dualLooper.totalTime - this.lastShootTime > this.shootInterval) {
		// console.log("shoot");

		this.levelStats.shotsFired += 1;

		this.barrelCameraPos.y = this.barrelCameraShootY;

		var bulletStartPos = this.player.pos.clone2();
		bulletStartPos.x -= this.bulletHalfSideLength;
		bulletStartPos.y -= this.bulletHalfSideLength;

		var bulletStartPosAddition = Vector2.fromAngle(this.player.dir).setMagnitude(this.totalBarrelLength);

		bulletStartPos.add(bulletStartPosAddition);

		var newBullet = new Bullet({
			end: new Rect(
				bulletStartPos, this.bulletDim.clone()
			),
			topZ: this.bulletTopZ,
			botZ: this.bulletBotZ,
			velocity: Vector2.fromAngle(this.player.dir).setMagnitude(this.bulletSpeed).add(this.lastPlayerVelocity)
		});

		this.bullets.push(newBullet);

		this.lastShootTime = this.dualLooper.totalTime;
	}
};

Game.prototype.bulletToSmoke = function(bullet) {
	this.bullets.splice(this.bullets.indexOf(bullet), 1);

	this.bulletSmokes.push(bullet);

	var colorComponents = this.srng.randomInt(220, 252);
	var alpha = this.srng.randomInRange(0.3, 0.65);

	var color = new Color(colorComponents, colorComponents, colorComponents, alpha);

	for (var prop in bullet.cuboid.faces) {
		var newColor = color.clone();

		newColor.scale(this.srng.randomInRange(0.85, 1));
		newColor.round();

		bullet.cuboid.faces[prop].color = newColor;
	}
};

Game.prototype.addRammer = function(pos) {
	var initialOffset = this.srng.randomInRange(this.rammerOffsetMin, this.rammerOffsetMax);

	var rammer = new Rammer({
		end: new Rect(
			pos, this.rammerDim.clone()
		),
		topZ: this.rammerTopZ,
		botZ: this.rammerBotZ,
		offsetMin: this.rammerOffsetMin,
		offsetMax: this.rammerOffsetMax,
		initialOffset: initialOffset,
		offsetIncreasing: this.rammerOffsetIncreasing,
		offsetSpeed: this.rammerOffsetSpeed,
		moveSpeed: this.rammerMoveSpeed
	});

	this.rammers.push(rammer);
};

Game.prototype.killRammer = function(rammer) {
	this.levelStats.rammersKilled += 1;

	this.dieRammer(rammer);
};

Game.prototype.dieRammer = function(rammer) {
	this.rammers.splice(this.rammers.indexOf(rammer), 1);

	this.dyingRammers.push(rammer);
};

export default Game
