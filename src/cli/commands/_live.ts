import path from "path";
import fs from "fs";
import readline from "readline";
import util from "util";

import Line from "../../line";

export default class Live {
    private async asyncFilter(arr:Array<any>, predicate:any) :Promise<Array<any>> {
        const results = await Promise.all(arr.map(predicate));
        return arr.filter((_v, index) => results[index]);
    };

    private async getFilePaths(startPath:string, filter:string, filepaths:Array<string>):Promise<Array<string>> {
        if (!fs.existsSync(startPath)) return;

        const files = fs.readdirSync(startPath);
        let i = -1;

        while (++i < files.length) {
            const filepath = path.join(startPath, files[i]);
            const stat = fs.lstatSync(filepath);

            if (stat.isDirectory()) this.getFilePaths(filepath, filter, filepaths);
            else if (filepath.indexOf(filter) >= 0) filepaths.push(filepath);
        }

        return filepaths;
    };

    private async checkFileForOccurence(filePath:string, string:string) :Promise<boolean> {
        const fileStream = fs.createReadStream(filePath);
    
        const rl:any= readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    
        for await (const line of rl)
            if (line.includes(string))
                 return true;
        return false;
    };

    private async filteringFilePathsUsingString(filePaths:Array<string>, string:string) :Promise<Array<string>> {
        const filter = async (filePath:string) => {
            const isFileContainingString = await this.checkFileForOccurence(filePath, string);
            return isFileContainingString;
        };
    
        const filtered = await this.asyncFilter(filePaths, filter);
    
        return filtered;
    };

    private async getStratFiles(): Promise<Array<string>> {
        let jsFilePaths = await this.getFilePaths(path.join(process.cwd(), "./"), ".js", []);
    
        // Excluding this file.
        jsFilePaths = jsFilePaths.filter((fpath) => !fpath.includes(path.join(__dirname, "index.js")));
    
        let stratFiles = await this.filteringFilePathsUsingString(jsFilePaths, "Line.read");
        return stratFiles;
    };

    private async executeStratFiles(stratFiles:Array<string>): Promise<void> {
        stratFiles.forEach(async (stratFile) => {
            await require(stratFile);
        });
    };

    private async getFileLines(filePath:string) :Promise<{name:string, lines:Array<string>}> {
        const lines = [];
        const fileStream = fs.createReadStream(filePath);
    
        const rl:any = readline.createInterface({
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

    private async buildStrategiesArray():Promise<Array<{name:string, lines:Array<string>}>> {
        const strategies = [];
        const tradeFiles = await this.getFilePaths(path.join(process.cwd(), "./"), ".trade", []);
        for (const file of tradeFiles) {
            const strategy = await this.getFileLines(file);
            strategies.push(strategy);
        }
        return strategies;
    };

    private async getMatchArguments(match:Array<string>): Promise<Array<string>> {
        match.splice(0, 1);
    	return match;
    };

    private async executeStrategy(strategies:any) {
    	let match;

    	for (const instruction of Line.lexic)
    		for (const strategy of strategies)
    			for (const line of strategy.lines)
    				if (match = line.match(instruction.rule)) {
                        const args = await this.getMatchArguments(match);
    					await instruction.func(...args);
    					strategy.lines.splice(strategy.lines.indexOf(line), 1);
    				}
    };
  
    public async exec(): Promise<void> {
        const stratFiles = await this.getStratFiles();
        await this.executeStratFiles(stratFiles);
        const strategies = await this.buildStrategiesArray();
        await this.executeStrategy(strategies);
        process.exit();
    }
}