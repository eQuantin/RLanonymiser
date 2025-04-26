import { Command } from "@cliffy/command";
import * as log from "jsr:@timepp/enhanced-deno-log";

export type Config = {
    inputMode: "BallchasingURL" | "FilePath" | "Random" | "stdin";
    outputMode: "FilePath" | "DiscordWebhook" | "stdout";
    mode: "GuessTheGuest" | "GuessTheRank" | "ReplayValidation";
    token: string | undefined;
    replayPath: string | undefined;
    debug: boolean;
};

export type Options = {
    debug?: true | undefined;
    verbose?: true | undefined;
    output?: string | undefined;
    input?: string | undefined;
    token?: string | undefined;
    all?: true | undefined;
    guest?: true | undefined;
};

async function command(): Promise<Options> {
    let subCommand: { [key: string]: true } = {};

    const command = new Command()
        .name("Anonymiser")
        .version("1.0.0")
        .description("A simple CLI tool to anonymise your Rocket League replays")
        .globalOption("-d, --debug", "Enable debug output.")
        .globalOption("-v, --verbose", "Enable verbose output.")
        .globalOption(
            "-o, --output=<output:string>",
            "Allow either a discord webhook or a path. Defaults to stdout if argument isn't provided, see schema for stdout",
        )
        .globalOption(
            "-i, --input=<input:string>",
            "Allow either a ballchasing url or a path. Defaults to stdin if argument isn't provided, need a valid replay binary",
        )
        .globalOption(
            "-n, --name=<name:string>",
            "modified replay name",
        )
        .globalOption(
            "-p, --playlist=<playlist:string>",
            "Preconfigured playlist of ballchasing replays",
            {
                conflicts: ["input", "auto"],
            },
        )
        .globalOption(
            "-a, --auto",
            "Automaticaly select a replay from ballchasing",
            {
                conflicts: ["input", "playlist"],
            },
        )
        .globalOption(
            "-N, --number=<number:number>",
            "Number of replays to make",
            {
                depends: ["auto"],
            },
        )
        .globalOption(
            "-s, --season=<season:string>",
            "Season from which to select a replay",
            {
                depends: ["auto"],
            },
        )
        .globalOption(
            "-r, --rank=<rank:string>",
            "Rank from which to select a replay",
            {
                depends: ["auto"],
                conflicts: ["input"],
            },
        )
        .globalOption(
            "-l, --location=<region:string>",
            "Avaible regions ['EU', 'NA', 'MENA', 'OCE', 'SAM', 'APAC, 'SSA']",
            {
                depends: ["auto"],
            },
        )
        .command(
            "guest",
            "Anonymise all players, a selected player will be named Guest. See guest --help for more options",
        )
        .option(
            "--reversed",
            "Anonymise all players, all players will share the name of the selected player",
        )
        .action(() => {
            subCommand = { guest: true };
        })
        .command("all", "Anonymise all players. See all --help for more options")
        .action(() => {
            subCommand = { all: true };
        })
        .env("TOKEN=<TOKEN:string>", "Set your ballchasing token for api access");

    // Parse the arguments
    const { options } = await command.parse(Deno.args);
    return { ...options, ...subCommand };
}

export default async (): Promise<Config> => {
    const options = await command();

    // Logger configuration
    log.setConfig({ enabledLevels: [] }, "file");
    if (options.debug) log.setLogLevel("debug", "console");
    else {
        log.setLogLevel("info", "console");
    }
    log.init();

    const config: Config = {
        inputMode: "stdin",
        outputMode: "stdout",
        mode: "ReplayValidation",
        debug: false,
        token: Deno.env.has("TOKEN") ? Deno.env.get("TOKEN")! : options.token,
        replayPath: undefined,
    };

    console.log("Options", options);

    const BallchasingUrlRegex = new RegExp(/((https|http):\/\/ballchasing\.com\/replay\/.+)/);
    const WindowsPathRegex = new RegExp(/^(([a-zA-Z]{1}:|\\)(\\[^\\/<>:\|\*\?\"]+)+\.[^\\/<>:\|]{3,4})$/i);
    const LinuxPathRegex = new RegExp(/^(((?:\.\/|\.\.\/|\/)?(?:\.?\w+\/)*)(\.?\w+\.?\w+))$/);
    const DiscordWebhookRegex = new RegExp(/((https|http):\/\/discord\.com\/api\/webhooks\/\d{19}\/.+)/);

    // Input validation
    const validInputPath: boolean = Deno.build.os === "windows"
        ? !!options.input && !!options.input.match(WindowsPathRegex)
        : (Deno.build.os === "darwin" || Deno.build.os === "linux")
        ? !!options.input && !!options.input.match(LinuxPathRegex)
        : false;

    if (options.input == undefined) {
        console.debug("stdin input mode selected");
        config.inputMode = "stdin";
    } else if (
        options.input &&
        (options.input.match(BallchasingUrlRegex) ||
            validInputPath ||
            options.input == "random")
    ) {
        if (options.input.match(BallchasingUrlRegex)) {
            config.inputMode = "BallchasingURL";
            config.replayPath = options.input;
            console.debug("Ballchasing URL input mode selected");
        } else if (validInputPath) {
            // check presence of file, should check .replay file extension
            const path = await Deno.realPath(options.input);
            try {
                await Deno.open(path);
            } catch (err) {
                console.error("An error occured while checking presence of replay file", { path, err });
                Deno.exit(1);
            }
            config.inputMode = "FilePath";
            config.replayPath = options.input;
            console.debug("Replay file path input mode selected");
        } else if (options.input == "random") {
            config.inputMode = "Random";
            console.debug("Random input mode selected");
        }
    } else {
        console.error("Invalid input mode");
        Deno.exit(0);
    }

    // Output validation
    const validOutputPath: boolean = Deno.build.os === "windows"
        ? !!options.output && !!options.output.match(WindowsPathRegex)
        : (Deno.build.os === "darwin" || Deno.build.os === "linux")
        ? !!options.output && !!options.output.match(LinuxPathRegex)
        : false;
    if (options.output == undefined) {
        console.debug("stdout output mode selected");
        config.outputMode = "stdout";
    }

    if (
        !(Deno.env.has("TOKEN") || options.token) &&
        (config.inputMode == "BallchasingURL" || config.inputMode == "Random")
    ) {
        console.error(
            "You need to provide a ballchasing token, either with --token option or in env",
        );
        Deno.exit(0);
    }

    return config;
};
