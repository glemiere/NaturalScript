import { IExecutableStrategy } from "./interfaces";

export default class Strategy {
    private strategy: IExecutableStrategy;

    constructor(strategy: IExecutableStrategy){
        this.strategy = strategy;
    };

    public async execute() :Promise<void> {
        console.success(`Executing Strategy: ${this.strategy.name}`);
        for (const line of this.strategy.lines)
            await line.func(...line.args);
    };

    public async compile(binary?: boolean) :Promise<void> {
        console.log(`Compiling...`);
    };
 }