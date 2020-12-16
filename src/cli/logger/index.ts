import readline from "readline";
import { TxtCol } from "../../constants/colors";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});
const logger: Console = console;

logger.log = (message: string) => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${TxtCol.WHITE}${message}${TxtCol.WHITE}\n`);

    if (logger.isPrompting) {
        rl.prompt(true);
    }
};

logger.info = (message: string) => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${TxtCol.YELLOW}${message}${TxtCol.WHITE}\n`);

    if (logger.isPrompting) {
        rl.prompt(true);
    }
};

logger.error = (message: string) => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${TxtCol.RED}${message}${TxtCol.WHITE}\n`);

    if (logger.isPrompting) {
        rl.prompt(true);
    }
};

logger.success = (message: string) => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${TxtCol.GREEN}${message}${TxtCol.WHITE}\n`);

    if (logger.isPrompting) {
        rl.prompt(true);
    }
};

logger.isPrompting = false;

export default logger;
