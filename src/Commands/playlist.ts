import { Command, ValidationError } from "@cliffy/command";
import main from "../main.ts";

export const validPlaylists = [
    "BirminghamMajor",
];
export type Playlists = (typeof validPlaylists)[number];

export const NAME = "playlist";

export default (nodes: string[]) => {
    nodes.push(NAME);
    return new Command()
        .description("Preconfigured playlist of ballchasing replays, will ignore --input option")
        .arguments("[playlist:string]")
        .group("Misc options")
        .option(
            "-n, --number=<number:number>",
            "Number of replays to make, default to 1",
        )
        .option("--list", "List all avaible playlist")
        .action(async (options, playlist?: string) => {
            if (options.list) {
                console.log(validPlaylists);
                return;
            }
            if (playlist && !validPlaylists.includes(playlist)) {
                throw new ValidationError(
                    `Unknown playlist "${playlist}". Check avaible playlist by using playlist --list command`,
                );
            }
            await main({ ...options, ...nodes.map((parent) => ({ [parent]: true })) });
        });
};
