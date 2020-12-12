const { Line } = require("../lib");

const worst = 'WRST';

Line.read("test", async function(arg1, arg2) {
	console.log('Callback Called!');
	console.log('Argument 1:', arg1);
	console.log('Argument 2:', arg2);
});
