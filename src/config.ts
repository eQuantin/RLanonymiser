import * as log from "jsr:@timepp/enhanced-deno-log";
import { Playlists } from "./Commands/playlist.ts";
import { Locations, Ranks } from "./Commands/random.ts";

export const BallchasingUrlRegex = new RegExp(/((https|http):\/\/ballchasing\.com\/replay\/.+)/);
export const WindowsPathRegex = new RegExp(/^(([a-zA-Z]{1}:|\\)(\\[^\\/<>:\|\*\?\"]+)+\.[^\\/<>:\|]{3,4})$/i);
export const LinuxPathRegex = new RegExp(/^(((?:\.\/|\.\.\/|\/)?(?:\.?\w+\/)*)(\.?\w+\.?\w+))$/);
export const DiscordWebhookRegex = new RegExp(/((https|http):\/\/discord\.com\/api\/webhooks\/\d{19}\/.+)/);

export type Config = {
    debug: boolean;
    verbose: boolean;
    inputMode: "BallchasingURL" | "FilePath" | "Random" | "stdin";
    outputMode: "FilePath" | "DiscordWebhook" | "stdout";
    mode: "Guest" | "ReversedGuest" | "All" | "ReplayValidation";
    token: string | undefined;
    playersNameMap: Map<string, string>;
    inputPath: string | undefined;
    outputPath: string | undefined;
    replayName: string;
    replayOptions: {
        playlist?: Playlists;
        custom?: {
            location?: Locations;
            season?: string;
            rank?: Ranks;
        };
        number: number;
    };
};

export type Options = {
    debug?: true;
    verbose?: true;
    output?: string | true;
    input?: string | true;
    token?: string;
    replayName?: string;
    number?: number;
    season?: string;
    location?: Locations;
    rank?: Ranks;
    reversed?: true;
    playlist?: string;
    random?: true;
    all?: true;
    guest?: true;
};

const defaultConfig: Config = {
    inputMode: "stdin",
    outputMode: "stdout",
    mode: "ReplayValidation",
    debug: false,
    verbose: false,
    token: undefined,
    inputPath: undefined,
    outputPath: undefined,
    playersNameMap: new Map([]),
    replayName: "Anonymised replay",
    replayOptions: { number: 1 },
};

export default (options: Options): Config => {
    // Logger configuration
    log.setConfig({ enabledLevels: [] }, "file");
    log.setLogLevel("info", "console");
    if (options.verbose) log.setLogLevel("log", "console");
    if (options.debug) log.setLogLevel("debug", "console");
    log.init();

    console.debug("Options", options);

    const config: Config = {
        ...defaultConfig,
        debug: options.debug || defaultConfig.debug,
        verbose: options.verbose || defaultConfig.verbose,
        token: options.token,
        replayName: options.replayName || defaultConfig.replayName,
        replayOptions: {
            number: options.number || defaultConfig.replayOptions.number,
            custom: {
                location: options.location,
                rank: options.rank,
                season: options.season,
            },
            playlist: options.playlist,
        },
    };

    if (options.guest && options.reversed) config.mode = "ReversedGuest";
    else if (options.guest && !options.reversed) config.mode = "Guest";
    else if (options.all) config.mode = "All";

    const matchWindowsPath = typeof (options.input) == "string" && Deno.build.os === "windows" &&
        options.input.match(WindowsPathRegex);
    const matchUnixPath = typeof (options.input) == "string" &&
        (Deno.build.os === "darwin" || Deno.build.os === "linux") &&
        options.input.match(LinuxPathRegex);
    const matchBallchasingUrl = typeof (options.input) == "string" && options.input.match(BallchasingUrlRegex);

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
