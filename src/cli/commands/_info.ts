export default class Info {

  // constructor(
  // ) {}

  public async exec(): Promise<void> {
    const author = require("../../../package.json").author;
    const repo = "https://github.com/glemiere/tradescript/"

    // tslint:disable: no-console
    console.success(`Author: ${author}.`);
    console.success(`Repo: ${repo}.`);
    // tslint:enable: no-console

    process.exit();
  }
}
