import {
    ProjectScanner,
    StrategyBuilder
} from "./core";

export default class Live {
    private projectScanner: ProjectScanner;
    private strategyBuilder: StrategyBuilder;

    constructor() {
        this.projectScanner = new ProjectScanner();
        this.strategyBuilder = new StrategyBuilder();
    };

    private async executeStrategies(executableStrategies:Array<{name:string, lines:Array<{func: Function, args: Array<string>}>}>) {
        for (const strategy of executableStrategies) {
            console.success(`Executing Strategy: ${strategy.name}`);
            for (const line of strategy.lines)
                await line.func(...line.args);
        }
    };

    public async exec(): Promise<void> {
        await this.projectScanner.init();

        const stratFiles = await this.projectScanner.getStrategyFiles();

        // TODO: Discuss design decision with Matheo, keep it stateless or go full OOP to chain methods.
        const rawStrategies = await this.strategyBuilder.getStrategiesRawData(stratFiles);
        const executableStrategies = await this.strategyBuilder.buildExecutableStrategies(rawStrategies);

        await this.executeStrategies(executableStrategies);

        process.exit();
    };
}