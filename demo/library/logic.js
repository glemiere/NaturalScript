const { Line } = require("tradescript");

Line.read(/^Find the lowest performing ?(.*) asset/, async function(kind) {
	console.log('Callback Called! Find the lowe...');
	console.log(`Argument 1 ${kind}`);
});

Line.read(/^Purchase it at the end of the day/, async function(arg1, arg2) {
	console.log('Callback Called! Purchase it at...');
});

Line.read(/^Sell it at the end of the next day/, async function(arg1, arg2) {
	console.log('Callback Called! Sell it at the end of...');
});
