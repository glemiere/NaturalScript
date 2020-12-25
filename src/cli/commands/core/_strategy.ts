import { StrategyBuilder } from "./";
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

        console.log(JSON.stringify(compilable, null, 2));
    };
}