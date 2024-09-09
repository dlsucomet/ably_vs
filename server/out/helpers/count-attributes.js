/**
 * @summary This file contains a function that counts the number of attributes that can be evaluated.
 */

// A list of the rules related to the attributes
const rules = [
	{ name: 'area', score: 1 },
	{ name: 'background-position-x', score: 1 },
	{ name: 'background-position-y', score: 1 },
	{ name: 'background-size', score: 1 },
	{ name: 'border-radius', score: 1 },
	{ name: 'button', score: 1 },
	{ name: 'font-size', score: 1 },
	{ name: 'height', score: 1 },
	{ name: 'html', score: 1 },
	{ name: 'img', score: 1 },
	{ name: 'input', score: 5 },
	{ name: 'left', score: 1 },
	{ name: 'letter-spacing', score: 1 },
	{ name: 'line-height', score: 1 },
	{ name: 'margin', score: 1 },
	{ name: 'max-height', score: 1 },
	{ name: 'min-height', score: 1 },
	{ name: 'min-width', score: 1 },
	{ name: 'opacity', score: 1 },
	{ name: 'outline-offset', score: 1 },
	{ name: 'padding', score: 1 },
	{ name: 'right', score: 1 },
	{ name: 'select', score: 3 },
	{ name: 'text-indent', score: 1 },
	{ name: 'textarea', score: 1 },
	{ name: 'title', score: 1 },
	{ name: 'top', score: 1 },
	{ name: 'transform-origin', score: 1 },
	{ name: 'width', score: 1 },
	{ name: 'z-index', score: 1 },
];

// A function that counts style attributes to put in a score
function countAttributes(html) {
	const counts = {};
	let total = 0;
	// Regex looking for the attributes in HTML tags
	for (const { name, score } of rules) {
		const regex = new RegExp(`<${name}[^>]*>`, 'gi');
		const count = (html.match(regex) || []).length;
		counts[name] = count;
		total += count * score;
		// console.log(count, elements);
	}
	// Regex looking for the attributes in CSS
	for (const { name, score } of rules) {
		const regex = new RegExp(`${name}:`, 'gi');
		const count = (html.match(regex) || []).length;
		counts[name] = count;
		total += count * score;
		// console.log(score)
	}
	return total;
}

module.exports = countAttributes;