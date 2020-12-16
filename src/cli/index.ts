import * as Error from "./error";
import logger from "./logger";

import {
  Info,
  Live
} from "./commands";

export default class Cli {
  public options: Array<{cmdStr: string, exec: () => any}>;
  public info: Info;
  public live: Live;

  constructor(
    public args: string[],
  ) {
    this.args     = args;
    this.options  = new Array();
    this.info     = new Info();
    this.live     = new Live();
  }

  public async init(): Promise<void> {
    this.options.push(
      {cmdStr: `help`, exec: this.help.bind(this)},
      {cmdStr: `info`, exec: this.info.exec.bind(this.info)},
      {cmdStr: `live`, exec: this.live.exec.bind(this.live)},
    );

    const isVerbose = this.args.indexOf("--verbose") != -1;
    new Error.Handler().init(isVerbose ? true : false);

    console = logger;
  }

  public async exec(cmdStr: string): Promise<void> {
    const command = this.options.filter((cmd) => {
      return cmd.cmdStr === cmdStr;
    })[0];

    if (command) {
      command.exec();
    } else {
      // tslint:disable-next-line: no-unused-expression
      new Error.Handler("error", Error.Messages.CMD_NOT_FND);
    }
  }

  public async welcome(): Promise<void> {
    const pkg   = require("../../package.json");

    const name    = pkg.name;
    const version = pkg.version;

    // tslint:disable: no-console
    console.success(`🔥 Currently using ${name} V${version} 🔥\n`);
    // tslint:enable: no-console
  }

  public async help(): Promise<void> {
    // tslint:disable: no-console
    console.info(`Usage: tradescript [option].`);
    console.log(`Available options:`);
    // tslint:enable: no-console

    for (const opt of this.options) {
      // tslint:disable-next-line: no-console
      console.log(`* ${opt.cmdStr}`);
    }

    process.exit();
  }
}
