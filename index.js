// Execute all JS files using Line
// Import lang
// Read .trade files
// Decouple files into lines
// Apply rules to match funcs
// Execute funcs

const path = require("path");
const fs = require("fs");

const green = "\x1b[32m";
const white = "\x1b[37m";

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

const main = async () => {
    let jsFilePaths = await getFilePaths(path.join(__dirname, "./"), ".js", []);

    console.log(jsFilePaths);
};

main();
