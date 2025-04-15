import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
import * as log from "jsr:@timepp/enhanced-deno-log";

import main from "./main.ts";

/*  TODOS
 *  -> Create a replay cache to avoid ballchasing rate limits and to avoid anonymising the same replay multiple times
 *  -> Change logger
 *  -> Parse replay header to provide basic informations, this class could be the bridge with anonymising functions
 */

/*  -o output, text file, discord webhook
 *  -m mode, guessTheGuest, guessTheRank
 *  -i input, replay file, ballchasing url
 *  -d debug logging
 *  -v verbose logging
 *  -t token, ballchsing token optionnal if the replay is provided, advised to set
 */

const { options } = await new Command()
    .name("Anonymiser")
    .version("1.0.0")
    .description("A simple CLI tool to anonymise your Rocket League replays")
    .option("-d, --debug", "Enable debug output.")
    .option("-v, --verbose", "Enable verbose output.")
    .option(
        "-m, --mode=<mode>",
        'Avaible modes "Guess The Guest", "Guess The Rank", "Replay Validation". Defaults to replay validation mode if argument isn\'t provided',
    )
    .option(
        "-o, --output=<output>",
        "Allow either a discord webhook or a path. Defaults to stdout if argument isn't provided, see schema for stdout",
    )
    .option(
        "-i, --input=<input>",
        'Allow either a ballchasing url, path of a replay file, "random". Defaults to stdin if argument isn\'t provided, need a valid replay binary',
    )
    .env("TOKEN=<TOKEN>", "Set your ballchasing token for api access")
    .option(
        "-t, --token=<token>",
        "Set your ballchasing token for api access",
    )
    .parse(Deno.args);

// Logger configuration
log.setConfig({ enabledLevels: [] }, "file");
if (options.debug) log.setLogLevel("debug", "console");
else {
    log.setLogLevel("info", "console");
}
log.init();

// Program Config
export type Config = {
    inputMode: "BallchasingURL" | "FilePath" | "Random" | "stdin";
    outputMode: "FilePath" | "DiscordWebhook" | "stdout";
    mode: "GuessTheGuest" | "GuessTheRank" | "ReplayValidation";
    token: string | undefined;
};

const config: Config = {
    inputMode: "stdin",
    outputMode: "stdout",
    mode: "ReplayValidation",
    token: undefined,
};

// Input validation and config
const BallchasingUrlRegex = new RegExp(/((https|http):\/\/ballchasing\.com\/replay\/.+)/);
const WindowsPathRegex = new RegExp(/^(([a-zA-Z]{1}:|\\)(\\[^\\/<>:\|\*\?\"]+)+\.[^\\/<>:\|]{3,4})$/i);
const LinuxPathRegex = new RegExp(/^(((?:\.\/|\.\.\/|\/)?(?:\.?\w+\/)*)(\.?\w+\.?\w+))$/);
const DiscordWebhookRegex = new RegExp(/((https|http):\/\/discord\.com\/api\/webhooks\/\d{19}\/.+)/);

// Early exit if the input is invalid
// TODO make windows and linux path check platform aware, check .replay file extension
if (options.input == undefined) {
    console.debug("stdin input mode selected");
    config.inputMode = "stdin";
} else if (
    options.input &&
    (options.input.match(BallchasingUrlRegex) ||
        options.input.match(WindowsPathRegex) ||
        options.input.match(LinuxPathRegex) ||
        options.input == "random")
) {
    if (options.input.match(BallchasingUrlRegex)) {
        config.inputMode = "BallchasingURL";
        console.debug("Ballchasing URL input mode selected");
    } else if (
        options.input.match(WindowsPathRegex) ||
        options.input.match(LinuxPathRegex)
    ) {
        // check presence of file
        config.inputMode = "FilePath";
        console.debug("Replay file path input mode selected");
    } else if (options.input == "random") {
        config.inputMode = "Random";
        console.debug("Random input mode selected");
    }
} else {
    console.error("Invalid input mode");
    Deno.exit(0);
}

if (
    !(Deno.env.has("TOKEN") || options.token) && (config.inputMode == "BallchasingURL" || config.inputMode == "Random")
) {
    console.error(
        "You need to provide a ballchasing token, either with --token option or in env",
    );
    Deno.exit(0);
}

const ballchasingId = options.input!.split("/")[4];
const ballchasingToken: string = Deno.env.has("TOKEN") ? Deno.env.get("TOKEN")! : options.token!;

await main(ballchasingId, ballchasingToken, options.debug);

Deno.exit(0);
