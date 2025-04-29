import { Command } from "@cliffy/command";
import main from "../main.ts";
import playlist from "./playlist.ts";
import random from "./random.ts";

export const NAME = "all";

export default (nodes: string[]) => {
    const clonedNodes = [...nodes];
    clonedNodes.push(NAME);
    return new Command()
        .description("Anonymise all players. See all --help for more options")
        .action(async (options) => {
            const parents = Object.fromEntries(clonedNodes.map((parent) => [parent, true]));
            await main({ ...(options as any), ...parents });
        })
        .command("playlist", playlist(clonedNodes))
        .command("random", random(clonedNodes));
};
