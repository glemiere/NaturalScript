import md5 from "crypto-js/md5";
import Line from "../../line";
import { ProjectScanner } from "./core";

export default class Live {
    private projectScanner: ProjectScanner;

    constructor() {
        this.projectScanner = new ProjectScanner();
    }

    private async getStrategiesRawData(stratFiles:Array<string>):Promise<Array<{name:string, lines:Array<string>}>> {
        const strategies = [];

        for (const file of stratFiles) {
            const strategy = await this.projectScanner.readStrategyFile(file);
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
        const instructionFiles = await this.projectScanner.getInstructionFiles();
        await this.projectScanner.executeInstructionFiles(instructionFiles);

        const stratFiles = await this.projectScanner.findStrategyFiles();
        const rawStrategies = await this.getStrategiesRawData(stratFiles);
        const executableStrategies = await this.buildExecutableStrategies(rawStrategies);
        await this.executeStrategies(executableStrategies);

        process.exit();
    }
}