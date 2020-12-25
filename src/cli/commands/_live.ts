import {
    ProjectScanner,
    StrategyBuilder,
    Strategy
} from "./core";

import { IExecutableStrategy } from "./core/interfaces";

export default class Live {
    private projectScanner: ProjectScanner;
    private strategyBuilder: StrategyBuilder;

    constructor() {
        this.projectScanner = new ProjectScanner();
        this.strategyBuilder = new StrategyBuilder();
    };

    private async executeStrategies(executableStrategies:Array<IExecutableStrategy>) {
        for (const strategy of executableStrategies)
            await new Strategy(strategy).execute();
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