import { StrategyBuilder } from "./";
import fs from "fs";
import path from "path";
import md5 from "crypto-js/md5";
import { IExecutableStrategy } from "./interfaces";

export default class Strategy {
    private strategy: IExecutableStrategy;
    private strategyBuilder: StrategyBuilder;

    constructor(strategy: IExecutableStrategy){
        this.strategy = strategy;
        this.strategyBuilder = new StrategyBuilder();
    };

    public async execute() :Promise<void> {
        console.success(`Executing Strategy: ${this.strategy.name}`);
        for (const line of this.strategy.lines)
            await line.func(...line.args);
    };

    public async compile(binary?: boolean) :Promise<void> {
        console.success(`Compiling... ${this.strategy.name}`);
        const compilable = await this.strategyBuilder.makeCompilableStrategyObject(this.strategy.lines);
        await this.buildFile(compilable);
    };

    public async getStrategyHash(): Promise<string> {
        let hash = "";
        for (const line of this.strategy.lines)
            hash += line.hash
        return md5(hash).toString();
    }

    private buildMain(compilable: any) :string {
        const content = Object.keys(compilable).map((funcName: string) => {
            return `await ${funcName}(${compilable[funcName].args.join(",")})`;
        }).join(';');

        return `async function main(){${content}}`;
    }

    private async buildFile(compilable:any) :Promise<any> {
        const filename = `${path.join(process.cwd(), `out/${await this.getStrategyHash()}.js`)}`;

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filename);

            Object.keys(compilable).forEach((key) => {
                file.write(`${compilable[key].func}\n`);
            });
            
            file.write(`${this.buildMain(compilable)}\n`);
            file.write(`(async () => {await main()})();`);
            file.end();

            file.on("finish", (result) => { resolve(result); });
            file.on("error", (error) => { resolve(error); });
        });
    }
}