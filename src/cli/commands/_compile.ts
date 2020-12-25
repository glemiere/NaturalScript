import {
    ProjectScanner,
    StrategyBuilder
} from "./core";

export default class Compile {
    private projectScanner: ProjectScanner;
    private strategyBuilder: StrategyBuilder;

    constructor() {
        this.projectScanner = new ProjectScanner();
        this.strategyBuilder = new StrategyBuilder();
    };

    public async exec(): Promise<void> {
        await this.projectScanner.init();

        const stratFiles = await this.projectScanner.getStrategyFiles();
        const rawStrategies = await this.strategyBuilder.getStrategiesRawData(stratFiles);

        console.log('Compiling...');
        console.log(JSON.stringify(rawStrategies, null, 2));

        const instructionFiles = await this.projectScanner.getInstructionFiles();
        console.log(JSON.stringify(instructionFiles, null, 2));
        
        process.exit();
    };
}