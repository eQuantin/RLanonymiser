import { Command, ValidationError } from "@cliffy/command";
import main from "../main.ts";

export const NAME = "random";

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
const LATEST_SEASON = "f18";

// Function to check if a season is valid
const isValidSeason = (season: string): boolean => {
    const isFree2Play = season.charAt(0).toLowerCase() === "f";
    const seasonNumber = Number(season.slice(1));

    if (isFree2Play) {
        const latestSeasonNumber = Number(LATEST_SEASON.slice(1));
        return seasonNumber >= FREE_SEASON_MIN && seasonNumber <= latestSeasonNumber;
    } else {
        return seasonNumber >= PAID_SEASON_MIN && seasonNumber <= PAID_SEASON_MAX;
    }
};

export default (nodes: string[]) => {
    nodes.push(NAME);
    return new Command()
        .description("Automaticaly select a replay from ballchasing")
        .group("Misc options")
        .option(
            "-n, --number=<number:number>",
            "Number of replays to make, default to 1",
        )
        .group("Replay selection filters")
        .option(
            "-s, --season=<season:string>",
            `Season from which to select a replay', default to latest season supported. Use season number preceded by
                an 'f' for free to play seasons. Latest supported season: ${LATEST_SEASON}`,
            {
                value: (season: string): string => {
                    if (!isValidSeason(season)) {
                        throw new ValidationError(`Season "${season}" is either unknown or unavaible at the moment`);
                    }
                    return season;
                },
            },
        )
        .option(
            "-r, --rank=<rank:string>",
            "Rank from which to select a replay, default to random. Use short format of ranks like d2 for diamand 2",
            {
                value: (rank: string): Ranks => {
                    if (!validRanks.includes(rank as Ranks)) {
                        throw new ValidationError(`Unknown rank "${rank}"`);
                    }
                    return rank as Ranks;
                },
            },
        )
        .option(
            "-l, --location=<location:string>",
            `Avaible regions [${validLocations.join(", ")}], default to random`,
            {
                value: (location: string): Locations => {
                    if (!validLocations.includes(location as Locations)) {
                        throw new ValidationError(`Unknown location "${location}"`);
                    }
                    return location as Locations;
                },
            },
        )
        .action(async (options) => {
            await main({ ...options, ...nodes.map((parent) => ({ [parent]: true })) });
        });
};
