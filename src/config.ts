import { Command, ValidationError } from "@cliffy/command";
import * as log from "jsr:@timepp/enhanced-deno-log";

const BallchasingUrlRegex = new RegExp(/((https|http):\/\/ballchasing\.com\/replay\/.+)/);
const WindowsPathRegex = new RegExp(/^(([a-zA-Z]{1}:|\\)(\\[^\\/<>:\|\*\?\"]+)+\.[^\\/<>:\|]{3,4})$/i);
const LinuxPathRegex = new RegExp(/^(((?:\.\/|\.\.\/|\/)?(?:\.?\w+\/)*)(\.?\w+\.?\w+))$/);
const DiscordWebhookRegex = new RegExp(/((https|http):\/\/discord\.com\/api\/webhooks\/\d{19}\/.+)/);

export enum Locations {
    EU = "EU",
    NA = "NA",
    MENA = "MENA",
    OCE = "OCE",
    SAM = "SAM",
    APAC = "APAC",
    SSA = "SSA",
}

export enum Playlist {}
export enum Rank {}
export enum Season {}

export type Config = {
    debug: boolean;
    inputMode: "BallchasingURL" | "FilePath" | "Random" | "stdin";
    outputMode: "FilePath" | "DiscordWebhook" | "stdout";
    mode: "Guest" | "ReversedGuest" | "All" | "ReplayValidation";
    token: string | undefined;
    playersNameMap: Map<string, string>;
    replayPath: string | undefined;
    replayName: string;
    replayOptions: {
        playlist?: Playlist;
        custom?: {
            player?: string;
            location?: Locations;
            season?: Season;
            rank?: Rank;
        };
        number: number;
    };
};

export type Options = {
    debug?: true | undefined;
    verbose?: true | undefined;
    output?: string | undefined;
    input?: string | undefined;
    token?: string | undefined;
    name?: string | undefined;
    playlist?: string | undefined;
    number?: number | undefined;
    season?: string | undefined;
    location?: string | undefined;
    reversed?: true | undefined;
    auto?: string | undefined;
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
            "-n, --name=<name:string>",
            "Modified replay name, default to 'Anonymised replay #<ballchasing_id>",
        )
        .group("IO options")
        .globalOption(
            "-i, --input=<input:string>",
            "Allow either a Ballchasing url or a path. Defaults to stdin if argument isn't provided, need a valid replay binary",
            {
                value: (value: string): string => {
                    const matchWindowsPath = Deno.build.os === "windows" && value.match(WindowsPathRegex);
                    const matchUnixPath = (Deno.build.os === "darwin" || Deno.build.os === "linux") &&
                        value.match(LinuxPathRegex);
                    const matchBallchasingUrl = value.match(BallchasingUrlRegex);
                    if (!(matchWindowsPath || matchUnixPath || matchBallchasingUrl)) {
                        throw new ValidationError(
                            "Argument must be either a path to a replay file or a Ballchasing URL",
                            { exitCode: 1 },
                        );
                    }
                    return value;
                },
            },
        )
        .globalOption(
            "-o, --output=<output:string>",
            "Allow either a Discord webhook or a path. Defaults to stdout if argument isn't provided, see schema for stdout",
            {
                value: (value: string): string => {
                    const matchWindowsPath = Deno.build.os === "windows" && value.match(WindowsPathRegex);
                    const matchUnixPath = (Deno.build.os === "darwin" || Deno.build.os === "linux") &&
                        value.match(LinuxPathRegex);
                    const matchDiscordWebhook = value.match(DiscordWebhookRegex);
                    if (!(matchWindowsPath || matchUnixPath || matchDiscordWebhook)) {
                        throw new ValidationError(
                            "Argument must be either a path to a replay file or a Discord webhook",
                            { exitCode: 1 },
                        );
                    }
                    return value;
                },
            },
        )
        .command(
            "playlist",
            "Preconfigured playlist of ballchasing replays",
        )
        .global()
        .arguments("<playlist:string>")
        .option(
            "-N, --number=<number:number>",
            "Number of replays to make, default to 1",
        )
        .command(
            "random",
            "Automaticaly select a replay from ballchasing", // should be a subcommand ?
        )
        .global()
        .option(
            "-N, --number=<number:number>",
            "Number of replays to make, default to 1",
        )
        .option(
            "-s, --season=<season:string>",
            "Season from which to select a replay', default to latest season supported",
        )
        .option(
            "-r, --rank=<rank:string>",
            "Rank from which to select a replay, default to random",
        )
        .option(
            "-l, --location=<region:string>",
            "Avaible regions ['EU', 'NA', 'MENA', 'OCE', 'SAM', 'APAC, 'SSA'], default to random",
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
        playersNameMap: new Map([]),
        replayName: "Anonymised replay #XX",
        replayOptions: { number: 1 },
    };

    console.log("Options", options);

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
