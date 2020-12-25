import { ProjectScanner } from "./core";

export default class Compile {
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

    public async exec(): Promise<void> {
        await this.projectScanner.init();

        const stratFiles = await this.projectScanner.getStrategyFiles();
        const rawStrategies = await this.getStrategiesRawData(stratFiles);

        console.log('Compiling...');
        console.log(JSON.stringify(rawStrategies, null, 2));

        const instructionFiles = await this.projectScanner.getInstructionFiles();
        console.log(JSON.stringify(instructionFiles, null, 2));
        
        process.exit();
    }
}