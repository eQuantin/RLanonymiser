import * as log from "jsr:@timepp/enhanced-deno-log";
import { Players } from "./players.ts";

// Regular expression for validating Ballchasing replay URLs
export const BallchasingUrlRegex = new RegExp(/((https|http):\/\/ballchasing\.com\/replay\/.+)/);

// Regular expression for validating replay file paths
export const pathRegex = new RegExp(
    String.raw`^([a-zA-Z]:\\|\\\\|\.{1,2}\\/)?([^<>:"/\\|?*]+[/\\])*[^<>:"/\\|?*]+\.replay$`,
    "i",
);

// Regular expression for validating Discord webhook URLs
export const DiscordWebhookRegex = new RegExp(/((https|http):\/\/discord\.com\/api\/webhooks\/\d{19}\/.+)/);

// Valid playlists for replay analysis
export const validPlaylists = [
    "BirminghamMajor",
] as const;
export type Playlists = (typeof validPlaylists)[number];

// Valid regions for replay analysis
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

// Valid ranks for replay analysis
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

// Configuration constants for season validation
export const SEASON_CONFIG = {
    PAID: {
        MIN: 1,
        MAX: 14,
    },
    FREE: {
        MIN: 1,
    },
    LATEST: "f16",
} as const;

/**
 * Validates if a season string is in the correct format and within valid ranges
 * @param season - The season string to validate (e.g., "f16" or "14")
 * @returns boolean indicating if the season is valid
 */
export const isValidSeason = (season: string): boolean => {
    const isFree2Play = season.charAt(0).toLowerCase() === "f";
    const seasonNumber = Number(season.slice(1));

    if (isFree2Play) {
        const latestSeasonNumber = Number(SEASON_CONFIG.LATEST.slice(1));
        return seasonNumber >= SEASON_CONFIG.FREE.MIN && seasonNumber <= latestSeasonNumber;
    } else {
        return seasonNumber >= SEASON_CONFIG.PAID.MIN && seasonNumber <= SEASON_CONFIG.PAID.MAX;
    }
};

/**
 * Command line options interface
 */
export interface Options {
    /** Enable debug logging */
    debug?: boolean;
    /** Enable verbose logging */
    verbose?: boolean;
    /** Output destination */
    output?: string | boolean;
    /** Input source */
    input?: string | boolean;
    /** Ballchasing API token */
    token?: string;
    /** Custom replay name */
    replayName?: string;
    /** Number of replays to process */
    number?: number;
    /** Season filter */
    season?: string;
    /** Region filter */
    location?: Locations;
    /** Rank filter */
    rank?: Ranks;
    /** Process replays in reverse order */
    reversed?: boolean;
    /** Playlist filter */
    playlist?: Playlists;
    /** Select random replays */
    random?: boolean;
    /** Process all replays */
    all?: boolean;
    /** Process guest replays */
    guest?: boolean;
}

/**
 * Configuration interface for the application
 */
export interface Config {
    debug: boolean;
    verbose: boolean;
    inputMode: "BallchasingURL" | "FilePath" | "Random" | "stdin";
    outputMode: "FilePath" | "DiscordWebhook" | "stdout";
    mode: "Guest" | "ReversedGuest" | "All" | "ReplayValidation";
    token: string | undefined;
    players: Players | undefined;
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
}

const uuid = crypto.randomUUID();

/**
 * Default configuration object
 */
const defaultConfig: Config = Object.freeze({
    inputMode: "stdin",
    outputMode: "stdout",
    mode: "ReplayValidation",
    debug: false,
    verbose: false,
    token: undefined,
    inputPath: undefined,
    outputPath: undefined,
    players: undefined,
    replayName: `Anonymised replay #${uuid}`,
    replayOptions: { number: 1 },
    uuid,
});

/**
 * Creates a configuration object from command line options
 * @param options - Command line options
 * @returns Configuration object
 * @throws Error if required configuration is missing or invalid
 */
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
        debug: options.debug ?? defaultConfig.debug,
        verbose: options.verbose ?? defaultConfig.verbose,
        token: Deno.env.get("TOKEN") ?? options.token,
        replayName: options.replayName ?? defaultConfig.replayName,
        replayOptions: {
            number: options.number ?? defaultConfig.replayOptions.number,
            custom: {
                location: options.location,
                rank: options.rank,
                season: options.season,
            },
            playlist: options.playlist,
        },
    };

    // Set operation mode
    if (options.guest && options.reversed) config.mode = "ReversedGuest";
    else if (options.guest && !options.reversed) config.mode = "Guest";
    else if (options.all) config.mode = "All";
    else config.mode = "ReplayValidation";

    // Set input mode and validate input
    if (options.input === true || options.input === undefined) {
        config.inputMode = "stdin";
    } else if (typeof options.input === "string") {
        const matchPath = pathRegex.test(options.input);
        const matchBallchasingUrl = BallchasingUrlRegex.test(options.input);

        console.debug("regex match", {
            matchPath,
            matchBallchasingUrl,
        });

        if (matchPath && matchBallchasingUrl) {
            console.debug("suspicious input", {
                matchBallchasingUrl,
                matchPath,
                inputString: options.input,
            });
        } else if (matchBallchasingUrl && !matchPath) {
            config.inputMode = "BallchasingURL";
        } else if (!matchBallchasingUrl && matchPath) {
            config.inputMode = "FilePath";
        }
        config.inputPath = options.input;
    }

    if (options.random || options.playlist) {
        config.inputMode = "Random";
    }

    // Set output mode and validate output
    if (options.output === true || options.output === undefined) {
        config.outputMode = "stdout";
    } else if (typeof options.output === "string") {
        const matchPath = pathRegex.test(options.output);
        const matchDiscordWebhook = DiscordWebhookRegex.test(options.output);

        if (matchDiscordWebhook && matchPath) {
            console.debug("suspicious output", {
                matchDiscordWebhook,
                matchPath,
                outputString: options.output,
            });
        } else if (matchDiscordWebhook && !matchPath) {
            config.outputMode = "DiscordWebhook";
        } else if (!matchDiscordWebhook && matchPath) {
            config.outputMode = "FilePath";
        }
        config.outputPath = options.output;
    }

    // Validate token requirement
    if (!config.token && (config.inputMode === "BallchasingURL" || config.inputMode === "Random")) {
        throw new Error(
            "You need to provide a ballchasing token, either with --token option or in env",
        );
    }

    // Validate playlist if provided
    if (options.playlist && !validPlaylists.includes(options.playlist)) {
        throw new Error(
            `Invalid playlist: ${options.playlist}. Valid playlists are: ${validPlaylists.join(", ")}`,
        );
    }

    console.debug("Config", config);

    return config;
};
