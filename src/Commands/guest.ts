import { Command } from "@cliffy/command";
import main from "../main.ts";
import playlist from "./playlist.ts";
import random from "./random.ts";

export const NAME = "guest";

export default (nodes: string[]) => {
    const clonedNodes = [...nodes];
    clonedNodes.push(NAME);
    return new Command()
        .description("Anonymise all players, a selected player will be named Guest. See guest --help for more options")
        .group("Misc options")
        .option(
            "--reversed",
            "All players will share the name of the selected player",
        )
        .action(async (options) => {
            const parents = Object.fromEntries(clonedNodes.map((parent) => [parent, true]));
            await main({ ...options, ...parents });
        })
        .command("playlist", playlist(clonedNodes))
        .command("random", random(clonedNodes));
};
