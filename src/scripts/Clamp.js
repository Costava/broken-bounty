export default function(val, min, max) {
	return Math.max(Math.min(val, max), min);
}
