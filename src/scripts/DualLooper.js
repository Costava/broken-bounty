/**
 * @param {object} o
 * - @property {array of functions} regWork
 * - @property {array of functions} finalWork
 * - @property {function} [stopCallback=function() {}]
 * - @property {number} [interval] - milliseconds
 * - @property {number} [maxNumIntervals]
 */
function DualLooper(o) {
	this.regWork = o.regWork;
	this.finalWork = o.finalWork;

	this.stopCallback = o.stopCallback || function() {};

	this.interval = o.interval || DualLooper.default.interval;
	this.maxNumIntervals = o.maxNumIntervals || DualLooper.default.maxNumIntervals;

	this.time = 0;
	this.totalTime = 0;

	this.looping = false;
	this.stopped = true;

	this.loopCallBound = this.loopCall.bind(this);
}

DualLooper.default = {
	interval: 8,
	maxNumIntervals: 4
};

//////////

DualLooper.prototype.accumulate = function(dt) {
	this.time += dt;
	this.totalTime += dt;
};

DualLooper.prototype.loopCall = function() {
	this.newTime = new Date().getTime();
	this.dt = this.newTime - this.oldTime;

	this.accumulate(this.dt);

	var potentialIntervals = Math.floor(this.time / this.interval);
	var runIntervals = Math.min(potentialIntervals, this.maxNumIntervals);

	//////////

	var i;
	for (i = 0; i < runIntervals; ++i) {
		var keepGoing = this.regWork();

		// `!foo` where foo is undefined is true
		if (!keepGoing) {
			// Since the ++i is skipped
			i += 1;

			break;
		}
	}

	if (i > 0) {
		this.time -= i * this.interval;
		this.finalWork();
	}

	//////////

	this.oldTime = this.newTime;

	if (this.looping) {
		window.requestAnimationFrame(this.loopCallBound);
	}
	else {
		this.stopped = true;

		this.stopCallback();
	}
};

//////////

DualLooper.prototype.start = function() {
	if (this.stopped) {
		this.oldTime = new Date().getTime();

		this.looping = true;
		this.stopped = false;

		this.loopCallBound();
	}
};

DualLooper.prototype.stop = function() {
	this.looping = false;
};

DualLooper.prototype.clearTime = function() {
	this.time = 0;
};

DualLooper.prototype.resetTime = function() {
	this.time = 0;
	this.totalTime = 0;
};

export default DualLooper
