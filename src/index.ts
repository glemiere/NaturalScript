#!/usr/bin/env node
import Cli from "./cli";

const cli = new Cli(process.argv.slice(2));

(async () => {
  await cli.init();
  await cli.welcome();
  
  if (!cli.args.length) {
    await cli.help();
  }
  
  await cli.exec(cli.args[0]);
})();

/* Exporting Line */
export { default as Line } from "./line";