// Execute all JS files using Line
// Import lang
// Read .trade files
// Decouple files into lines
// Apply rules to match funcs
// Execute funcs

const path = require("path");
const fs = require("fs");
const readline = require('readline');
const util = require('util');

const green = "\x1b[32m";
const white = "\x1b[37m";

const { Line } = require('./lib');

const asyncFilter = async (arr, predicate) => {
	const results = await Promise.all(arr.map(predicate));
	return arr.filter((_v, index) => results[index]);
};

const getFilePaths = async function (startPath, filter, filepaths) {
    if (!fs.existsSync(startPath)) return;

    const files = fs.readdirSync(startPath);
    let i = -1;

    while (++i < files.length) {
        const filepath = path.join(startPath, files[i]);
        const stat = fs.lstatSync(filepath);

        if (stat.isDirectory()) getFilePaths(filepath, filter, filepaths);
        else if (filepath.indexOf(filter) >= 0) filepaths.push(filepath);
    }

    return filepaths;
};

const checkFileForOccurence = async (filePath, string) => {
	const fileStream = fs.createReadStream(filePath);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl)
		if (line.includes(string))
	 		return true;
	return false;
};

const filteringFilePathsUsingString = async (filePaths, string) => {
	const filter = async (filePath) => {
		const isFileContainingString = await checkFileForOccurence(filePath, string);
		return isFileContainingString;
	};

	const filtered = await asyncFilter(filePaths, filter);

	return filtered;
};

const getStratFiles = async () => {
    let jsFilePaths = await getFilePaths(path.join(__dirname, "./"), ".js", []);
	
	// Excluding this file.
	jsFilePaths = jsFilePaths.filter((fpath) => !fpath.includes(path.join(__dirname, "index.js")));
	
	let stratFiles = await filteringFilePathsUsingString(jsFilePaths, "Line.read");
    return stratFiles;
};

const executeStratFiles = async (stratFiles) => {
	stratFiles.forEach(async (stratFile) => {
		await require(stratFile);
	});
};

const getFileLines = async (filePath) => {
	const lines = [];
	const fileStream = fs.createReadStream(filePath);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	for await (const line of rl)
		lines.push(line.trim());
	const name = lines.shift();
	return {
		name: name,
		lines: lines
	};
};

const buildStrategiesArray = async () => {
	const strategies = [];
	const tradeFiles = await getFilePaths(path.join(__dirname, "./"), ".trade", []);
	for (const file of tradeFiles) {
		strategy = await getFileLines(file);
		strategies.push(strategy);
	}
	return strategies;
};

const getMatchArguments = (match) => {
	match.splice(0, 1);
	return match;
};

const executeStrategy = async (strategies) => {
	let match;

	for (const instruction of Line.lexic)
		for (const strategy of strategies)
			for (const line of strategy.lines) {
				console.log(line, instruction.rule);
				if (match = line.match(instruction.rule))
					await instruction.func(...getMatchArguments(match));
					strategy.lines.shift();
			}
};

const main = async () => {
	const stratFiles = await getStratFiles();
	await executeStratFiles(stratFiles);
	const strategies = await buildStrategiesArray();
	await executeStrategy(strategies);
};

main();
