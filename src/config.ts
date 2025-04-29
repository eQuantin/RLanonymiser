import * as log from "jsr:@timepp/enhanced-deno-log";

export const BallchasingUrlRegex = new RegExp(/((https|http):\/\/ballchasing\.com\/replay\/.+)/);
export const pathRegex = new RegExp(
    /((\/.*|[a-zA-Z]:\\(?:([^<>:"\/\\|?*]*[^<>:"\/\\|?*.]\\|..\\)*([^<>:"\/\\|?*]*[^<>:"\/\\|?*.]\\?|..\\))?)\.replay)/iy,
);
export const DiscordWebhookRegex = new RegExp(/((https|http):\/\/discord\.com\/api\/webhooks\/\d{19}\/.+)/);

export const validPlaylists = [
    "BirminghamMajor",
];
export type Playlists = (typeof validPlaylists)[number];

export const validLocations = [
    "EU",
    "NA",
    "MENA",
    "OCE",
    "SAM",
    "APAC",
    "SSA",
] as const;
export type Locations = (typeof validLocations)[number];

export const validRanks = [
    "unranked",
    "b1",
    "b2",
    "b3",
    "s1",
    "s2",
    "s3",
    "g1",
    "g2",
    "g3",
    "p1",
    "p2",
    "p3",
    "d1",
    "d2",
    "d3",
    "c1",
    "c2",
    "c3",
    "gc1",
    "gc2",
    "gc3",
    "ssl",
] as const;
export type Ranks = (typeof validRanks)[number];

// Constants for season limits
const PAID_SEASON_MIN = 1;
const PAID_SEASON_MAX = 14;
const FREE_SEASON_MIN = 1;
export const LATEST_SEASON = "f16";

// Function to check if a season is valid
export const isValidSeason = (season: string): boolean => {
    const isFree2Play = season.charAt(0).toLowerCase() === "f";
    const seasonNumber = Number(season.slice(1));

    if (isFree2Play) {
        const latestSeasonNumber = Number(LATEST_SEASON.slice(1));
        return seasonNumber >= FREE_SEASON_MIN && seasonNumber <= latestSeasonNumber;
    } else {
        return seasonNumber >= PAID_SEASON_MIN && seasonNumber <= PAID_SEASON_MAX;
    }
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

const uuid = crypto.randomUUID();

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
    uuid: string;
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
    replayName: `Anonymised replay #${uuid}`,
    replayOptions: { number: 1 },
    uuid,
};

export default (options: Options): Config => {
    console.log("Options", options);

    // Logger configuration
    log.setConfig({ enabledLevels: [] }, "file");
    log.setLogLevel("info", "console");
    if (options.verbose) log.setLogLevel("log", "console");
    if (options.debug) log.setLogLevel("debug", "console");
    log.init();

    const config: Config = {
        ...defaultConfig,
        debug: options.debug || defaultConfig.debug,
        verbose: options.verbose || defaultConfig.verbose,
        token: Deno.env.get("TOKEN") || options.token,
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
    else config.mode = "ReplayValidation";

    if (options.input === true || options.input === undefined) config.inputMode = "stdin";
    else {
        const matchPath = pathRegex.test(options.input);
        const matchBallchasingUrl = BallchasingUrlRegex.test(options.input);
        console.debug("regexr match", {
            matchPath,
            matchBallchasingUrl,
        });
        if (matchPath && matchBallchasingUrl) {
            console.debug("suspicous input", {
                matchBallchasingUrl,
                matchPath,
                inputString: options.input,
            });
        } else if (matchBallchasingUrl && !matchPath) config.inputMode = "BallchasingURL";
        else if (!matchBallchasingUrl && matchPath) config.inputMode = "FilePath";
        config.inputPath = options.input;
    }
    if (options.random || options.playlist) config.inputMode = "Random";

    if (options.output === true || options.output === undefined) config.outputMode = "stdout";
    else {
        const matchPath = pathRegex.test(options.output);
        const matchDiscordWebhook = DiscordWebhookRegex.test(options.output);
        if (matchDiscordWebhook && matchPath) {
            console.debug("suspicous output", {
                matchDiscordWebhook,
                matchPath,
                outputString: options.output,
            });
        } else if (matchDiscordWebhook && !matchPath) config.outputMode = "DiscordWebhook";
        else if (!matchDiscordWebhook && matchPath) config.outputMode = "FilePath";
        config.outputPath = options.output;
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

    console.debug("Config", config);

    return config;
};
