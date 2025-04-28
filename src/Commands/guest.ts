import { Command } from "@cliffy/command";
import main from "../main.ts";
import playlist from "./playlist.ts";
import random from "./random.ts";

export const NAME = "guest";

export default (nodes: string[]) => {
    nodes.push(NAME);
    return new Command()
        .description("Anonymise all players, a selected player will be named Guest. See guest --help for more options")
        .group("Misc options")
        .option(
            "--reversed",
            "All players will share the name of the selected player",
        )
        .command("playlist", playlist(nodes))
        .command("random", random(nodes))
        .action(async (options) => {
            await main({ ...options, ...nodes.map((parent) => ({ [parent]: true })) });
        });
};
