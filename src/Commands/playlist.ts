import { Command, ValidationError } from "@cliffy/command";
import main from "../main.ts";
import { type Playlists, validPlaylists } from "../config.ts";

export const NAME = "playlist";

export default (nodes: string[]) => {
    const clonedNodes = [...nodes];
    clonedNodes.push(NAME);
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
            if (playlist && !validPlaylists.includes(playlist as Playlists)) {
                throw new ValidationError(
                    `Unknown playlist "${playlist}". Check avaible playlist by using playlist --list command`,
                );
            }
            const parents = Object.fromEntries(clonedNodes.map((parent) => [parent, true]));
            await main({ ...options, ...parents });
        });
};
