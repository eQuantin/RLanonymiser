import { Command } from "@cliffy/command";
import main from "../main.ts";
import playlist from "./playlist.ts";
import random from "./random.ts";

export const NAME = "all";

export default (nodes: string[]) => {
    nodes.push(NAME);
    return new Command()
        .description("Anonymise all players. See all --help for more options")
        .command("playlist", playlist(nodes))
        .command("random", random(nodes))
        .action(async (options) => {
            await main({ ...options, ...nodes.map((parent) => ({ [parent]: true })) });
        });
};
