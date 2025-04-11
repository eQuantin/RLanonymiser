import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import * as log from "jsr:@timepp/enhanced-deno-log";

import main from "./main.ts";

const { options } = await new Command()
  .name("Anonymiser")
  .version("1.0.0")
  .description("A simple CLI tool to anonymise your Rocket League replays")
  .env("DEBUG=<enable:boolean>", "Enable debug output.")
  .option("-d, --debug", "Enable debug output.")
  .option(
    "-u, --url=<url>",
    "Set a ballchasing url of a replay to anonymise",
    { required: true },
  )
  .env("TOKEN=<TOKEN>", "Set your ballchasing token for api access")
  .option(
    "-t, --token=<token>",
    "Set your ballchasing token for api access",
  )
  .parse(Deno.args);

if (options.debug) log.setLogLevel("debug", "all");
else {
  log.setConfig({ enabledLevels: [] }, "file");
  log.setLogLevel("info", "console");
}
log.init();

// Early exit if the ballchasing url is invalid
if (
  options.url.match(/((https|http):\/\/ballchasing\.com\/replay\/.+)/) ==
    null
) {
  console.error("Invalid ballchasing url");
  Deno.exit(0);
}

if (!Deno.env.has("TOKEN") && !options.token) {
  console.error(
    "You need to provide a ballchasing token, either with --token option or in env",
  );
  Deno.exit(0);
}

const ballchasingId = options.url.split("/")[4];
const ballchasingToken: string = Deno.env.has("TOKEN")
  ? Deno.env.get("TOKEN")!
  : options.token!;

await main(ballchasingId, ballchasingToken, options.debug);

Deno.exit(0);
