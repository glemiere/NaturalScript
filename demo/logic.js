const { Line } = require("../lib");

const worst = 'WRST';

Line.read(/^Find the lowest performing asset/, async function(arg1, arg2) {
	console.log('Callback Called! Find the lowe...');
	console.log('Argument 1:', arg1);
	console.log('Argument 2:', arg2);
});

Line.read(/^Purchase it at the end of the day/, async function(arg1, arg2) {
	console.log('Callback Called! Purchase it at...');
	console.log('Argument 1:', arg1);
	console.log('Argument 2:', arg2);
});

Line.read(/^Sell it at the end of the next day/, async function(arg1, arg2) {
	console.log('Callback Called! Sell it at the end of...');
	console.log('Argument 1:', arg1);
	console.log('Argument 2:', arg2);
});
