import { Command, ValidationError } from "@cliffy/command";
import main from "../main.ts";
import { isValidSeason, Locations, Ranks, SEASON_CONFIG, validLocations, validRanks } from "../config.ts";

export const NAME = "random";

export default (nodes: string[]) => {
    const clonedNodes = [...nodes];
    clonedNodes.push(NAME);
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
                an 'f' for free to play seasons. Latest supported season: ${SEASON_CONFIG.LATEST}`,
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
            const parents = Object.fromEntries(clonedNodes.map((parent) => [parent, true]));
            await main({ ...options, ...parents });
        });
};
