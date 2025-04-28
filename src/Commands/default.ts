import { Command, ValidationError } from "@cliffy/command";
import guest from "./guest.ts";
import all from "./all.ts";
import main from "../main.ts";
import playlist from "./playlist.ts";
import random from "./random.ts";
import { BallchasingUrlRegex, DiscordWebhookRegex, LinuxPathRegex, WindowsPathRegex } from "../config.ts";

export const NAME = "";

export default async () => {
    const nodes: string[] = [];
    nodes.push(NAME);
    await new Command()
        .name(NAME)
        .version("1.0.0")
        .description("A simple CLI tool to anonymise your Rocket League replays")
        .env("TOKEN=<TOKEN:string>", "Set your ballchasing token for api access")
        .globalOption("-d, --debug", "Enable debug output.")
        .globalOption("-v, --verbose", "Enable verbose output.")
        .globalOption(
            "-m, --replayName=<replayName:string>",
            "Modify replay name, default to 'Anonymised replay'",
        )
        .group("IO options")
        .globalOption(
            "-i, --input=[input:string]", // Should be a subcommand ? looks like an opposing command to random and playlist
            "Allow either a Ballchasing url or a path. Defaults to stdin if argument isn't provided, need a valid replay binary",
            {
                value: (value: string | true): string | true => {
                    if (typeof value == "string") {
                        const matchWindowsPath = Deno.build.os === "windows" && value.match(WindowsPathRegex);
                        const matchUnixPath = (Deno.build.os === "darwin" || Deno.build.os === "linux") &&
                            value.match(LinuxPathRegex);
                        const matchBallchasingUrl = value.match(BallchasingUrlRegex);
                        if (!(matchWindowsPath || matchUnixPath || matchBallchasingUrl)) {
                            throw new ValidationError(
                                "Argument must be either a path to a replay file or a Ballchasing URL",
                                { exitCode: 1 },
                            );
                        }
                    }
                    return value;
                },
            },
        )
        .globalOption(
            "-o, --output=[output:string]",
            "Allow either a Discord webhook or a path. Defaults to stdout, see schema for stdout",
            {
                value: (value: string | true): string | true => {
                    if (typeof value == "string") {
                        const matchWindowsPath = Deno.build.os === "windows" && value.match(WindowsPathRegex);
                        const matchUnixPath = (Deno.build.os === "darwin" || Deno.build.os === "linux") &&
                            value.match(LinuxPathRegex);
                        const matchDiscordWebhook = value.match(DiscordWebhookRegex);
                        if (!(matchWindowsPath || matchUnixPath || matchDiscordWebhook)) {
                            throw new ValidationError(
                                "Argument must be either a path to a replay file or a Discord webhook",
                                { exitCode: 1 },
                            );
                        }
                    }
                    return value;
                },
            },
        )
        .action((options) => {
            main(options);
        })
        .command("playlist", playlist(nodes))
        .command("random", random(nodes))
        .command("guest", guest(nodes))
        .command("all", all(nodes))
        .parse(Deno.args);
};
