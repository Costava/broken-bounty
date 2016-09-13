/**
 * @param {object} o
 * - @property {string} text
 * - @property {HTML canvas} canvas
 * - @property {2d context} ctx
 * - @property {number} [fontSize]
 * - @property {string} [fontFamily]
 * - @property {number} [speed]
 */
function ScrollText(o) {
	this.text = o.text;
	this.canvas = o.canvas;
	this.ctx = o.ctx;

	this.fontSize = o.fontSize || 16;
	this.fontFamily = o.fontFamily || 'sans-serif';

	this.ctxFont = this.getCtxFont();
	this.textMetrics = this.getTextMetrics();

	this.speed = o.speed || 0.001;

	this.progress = 0;

	this.doneMoving = false;
}

ScrollText.prototype.getCtxFont = function() {
	return `${String(this.fontSize)}px ${this.fontFamily}`;
};

ScrollText.prototype.getTextMetrics = function() {
	this.ctx.save();
		this.ctx.font = this.ctxFont;

		var textMetrics = this.ctx.measureText(this.text);
	this.ctx.restore();

	return textMetrics;
};

ScrollText.prototype.draw = function() {
	this.ctx.save();
		this.ctx.translate(-this.textMetrics.width, this.fontSize);
		this.ctx.translate(this.progress * (this.canvas.width + this.textMetrics.width), 0);

		this.ctx.textBaseline = 'top';
		this.ctx.font = this.ctxFont;
		this.ctx.fillStyle = '#fff';
		this.ctx.fillText(this.text, 0, 0);
	this.ctx.restore();
};

ScrollText.prototype.move = function() {
	if (this.progress < 1) {
		this.progress += this.speed;
	}
	else if (this.progress > 0.99) {
		this.doneMoving = true;
	}
};

export default ScrollText
