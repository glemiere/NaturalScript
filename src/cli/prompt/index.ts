import readline from "readline";
import { Interface } from "readline";
import logger from "../logger";

export default class Prompt {
    private rlInterface: Interface;
    private question: string;

    constructor(
        question: string,
    ) {
        this.rlInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });
        this.question = question;
    }

    public exec(): Promise<any> {
        logger.isPrompting = true;
        return new Promise((resolve, reject) => {
            this.rlInterface.question(`>> ${this.question}\n> `, (answer) => {
                this.rlInterface.close();
                logger.isPrompting = false;
                resolve(answer);
            });
        });
    }
}
