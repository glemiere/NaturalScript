import md5 from "crypto-js/md5";
import Line from "../../../line";
import { ProjectScanner } from "./";
import {
    IExecutableStrategy,
    IStrategyLine
} from "./interfaces";

export default class StrategyBuilder {
    private projectScanner: ProjectScanner;

    constructor() {
        this.projectScanner = new ProjectScanner();
    };

    public async buildExecutableStrategies(strategies:Array<{name:string, lines:Array<string>}>) :Promise<Array<IExecutableStrategy>> {
        const executableStrategies = new Array();

        for (const strategy of strategies) {
            const executableLines = await this._getExecutableStrategyLine(strategy.lines);

            executableStrategies.push({
                name: strategy.name,
                lines: executableLines
            });
        }

        return executableStrategies;
    };

    public async getStrategiesRawData(stratFiles:Array<string>):Promise<Array<{name:string, lines:Array<string>}>> {
        const strategies = [];

        for (const file of stratFiles) {
            const strategy = await this.projectScanner.readStrategyFile(file);
            strategies.push(strategy);
        }
        return strategies;
    };

    public async makeCompilableStrategyObject(lines: Array<IStrategyLine>) {
        let compilable:any = {};

        for (const line of lines) {
            const func = line.func.toString();
            const funcName = md5(func).toString();

            compilable[funcName] = {
                args: line.args,
                func: await this.nameFunction(func, funcName)
            };
        }

        return compilable;
    };

    private async nameFunction(func: string, name:string): Promise<string> {
        const insertCriteria = "async function";
        const insertAt = func.indexOf(insertCriteria) + insertCriteria.length;

        func = `${func.slice(0, insertAt)} ${name}${func.slice(insertAt)}`;
        return func;
    }

    private async _getMatchArguments(args:Array<string>): Promise<Array<string>> {
        args.splice(0, 1);
        let i = -1;

        while(args[++i])
            args[i] = args[i].split(`"`).join(``);

    	return args;
    };

    private async _getInstructionFromLexic(line: string) :Promise<any> {
        const argExtract = /(["])(?:(?=(\\?))\2.)*?\1/g;
        const args = line.match(argExtract);

        if (!args)
            return Line.lexic[md5(line).toString()];

        for (const arg of args) {
            const str  = line.replace(arg, '').match(Line.criteriaWordsOnly).join(" ");
            const hash = md5(str).toString();

            if (Line.lexic[hash])
                return Line.lexic[hash];
        }

        return null;
    };

    private async _getExecutableStrategyLine(lines:Array<string>):Promise<Array<{func:Function, args: Array<string>}>> {
        const executableLines = new Array();

        for (const line of lines) {
            const instruction = await this._getInstructionFromLexic(line);

            if (!instruction || (instruction && !line.match(instruction.rule))) {
                console.error(`Error, line: "${line}" does not match any instruction.`);
                process.exit(0);
            }

            const args = await this._getMatchArguments(line.match(instruction.rule));
            executableLines.push({
                func: instruction.func,
                args: args
            });
        }

        return executableLines;
    };
}