import path from "path";
import fs from "fs";
import readline from "readline";
import md5 from "crypto-js/md5";

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

    private async getInstructionFiles(): Promise<Array<string>> {
        let jsFilePaths = await this.getFilePaths(path.join(process.cwd(), "./"), ".js", []);
    
        // Excluding this file.
        jsFilePaths = jsFilePaths.filter((fpath) => !fpath.includes(path.join(__dirname, "index.js")));
    
        let stratFiles = await this.filteringFilePathsUsingString(jsFilePaths, "Line.read");
        return stratFiles;
    };

    private async executeInstructionFiles(stratFiles:Array<string>): Promise<void> {
        stratFiles.forEach(async (stratFile) => {
            await require(stratFile);
        });
    };

    private async readStrategyFile(filePath:string) :Promise<{name:string, lines:Array<string>}> {
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

    private async findStrategyFiles():Promise<Array<string>> {
        const cmd_args = process.argv.splice(3);
        let stratFiles;

        if (cmd_args.length > 0)
            stratFiles = cmd_args.map((filepath) => {
                return path.join(process.cwd(), filepath);
            });
        else
            stratFiles = await this.getFilePaths(path.join(process.cwd(), "./"), ".trade", []);

        return stratFiles;
    };

    private async getStrategiesRawData(stratFiles:Array<string>):Promise<Array<{name:string, lines:Array<string>}>> {
        const strategies = [];

        for (const file of stratFiles) {
            const strategy = await this.readStrategyFile(file);
            strategies.push(strategy);
        }
        return strategies;
    };

    private async getMatchArguments(args:Array<string>): Promise<Array<string>> {
        args.splice(0, 1);
        let i = -1;

        while(args[++i])
            args[i] = args[i].split(`"`).join(``);

    	return args;
    };

    private async getInstructionFromLexic(line: string) :Promise<any> {
        const argExtract = /(["])(?:(?=(\\?))\2.)*?\1/g;
        const args = line.match(argExtract);

        if (!args)
            return Line.lexic[md5(line).toString()];

        for (const arg of args) {
            const str  = line.replace(arg, '').match(Line.criteria).join(" ");
            const hash = md5(str).toString();

            if (Line.lexic[hash])
                return Line.lexic[hash];
        }

        return null;
    };

    private async getExecutableStrategyLine(lines:Array<string>):Promise<Array<{func:Function, args: Array<string>}>> {
        const executableLines = new Array();

        for (const line of lines) {
            const instruction = await this.getInstructionFromLexic(line);

            if (!instruction || (instruction && !line.match(instruction.rule))) {
                console.error(`Error, line: "${line}" does not match any instruction.`);
                process.exit(0);
            }

            const args = await this.getMatchArguments(line.match(instruction.rule));
            executableLines.push({
                func: instruction.func,
                args: args
            });
        }

        return executableLines;
    }

    private async buildExecutableStrategies(strategies:Array<{name:string, lines:Array<string>}>) :Promise<Array<{name:string, lines:Array<{func: Function, args: Array<string>}>}>> {
        const executableStrategies = new Array();

        for (const strategy of strategies) {
            const executableLines = await this.getExecutableStrategyLine(strategy.lines);

            executableStrategies.push({
                name: strategy.name,
                lines: executableLines
            });
        }

        return executableStrategies;
    };

    private async executeStrategies(executableStrategies:Array<{name:string, lines:Array<{func: Function, args: Array<string>}>}>) {
        for (const strategy of executableStrategies) {
            console.success(`Executing Strategy: ${strategy.name}`);
            for (const line of strategy.lines)
                await line.func(...line.args);
        }
    };
  
    public async exec(): Promise<void> {
        const instructionFiles = await this.getInstructionFiles();
        await this.executeInstructionFiles(instructionFiles);

        const stratFiles = await this.findStrategyFiles();
        const rawStrategies = await this.getStrategiesRawData(stratFiles);
        const executableStrategies = await this.buildExecutableStrategies(rawStrategies);
        await this.executeStrategies(executableStrategies);

        process.exit();
    }
}