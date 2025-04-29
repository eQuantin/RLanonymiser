import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { Ballchasing } from "./ballchasing.ts";
import { Rattletrap } from "./rattletrap.ts";
import anonymiser, { Replay } from "./Anonymiser/anonymiser.ts";
import Config, { Options } from "./config.ts";

export default async function (options: Options) {
    const config = Config(options);

    // STEP 1 -> CREATE WORK DIRECTORY
    console.info("Create work directory to store logs and replays");
    let workdir: string | undefined;
    try {
        const path = `replays/${config.uuid}`;
        Deno.mkdirSync(path, { recursive: true });
        workdir = await Deno.realPath(path);
    } catch (err) {
        if (!(err instanceof Deno.errors.AlreadyExists)) {
            throw err;
        } else {
            console.debug("Dir already exist.");
        }
    }
    if (workdir == undefined) {
        throw new Error();
    }

    const rattletrap = new Rattletrap(workdir, options.debug);

    // STEP 2 -> INSTALL RATTLETRAP
    console.info("Checking Rattletrap installation and version");
    try {
        const currentRattletrapVersion = await rattletrap
            .checkRattletrapVersion();
        if (currentRattletrapVersion == null) {
            console.debug(
                "Rattletrap isn't installed. Installing Rattletrap ...",
            );
            await rattletrap.downloadRattletrap();
        } else if (rattletrap.version != currentRattletrapVersion) {
            console.debug(
                `Invalid Rattletrap version, expected version ${rattletrap.version} but got version ${currentRattletrapVersion},
                    updating/downgrading Rattletrap ...`,
            );
            Deno.removeSync(rattletrap.path);
            await rattletrap.downloadRattletrap();
        }
    } catch (err) {
        console.error(
            "An error occured while checking or installing Rattletrap",
            err,
        );
        throw new Error();
    }

    // STEP 3 -> RETRIEVE REPLAYY BINARIES
    let replayBin: Uint8Array | undefined;
    if (config.inputMode === "BallchasingURL" || config.inputMode === "Random") {
        const ballchasing = new Ballchasing(config.token, workdir, options.debug);

        // CHECK BALLCHASING API AVAIBILITY
        console.info("Check avaibility of Ballchasing API");
        let ballchasingStatus: number;
        try {
            ballchasingStatus = await ballchasing.ping();
            switch (ballchasingStatus) {
                case 200:
                    console.debug(
                        "Ballchasing API is avaible and we are authorized",
                    );
                    break;
                case 401:
                    console.error("Invalid ballchasing token, exiting");
                    throw new Error();
                case 500:
                    console.error("Ballchasing API is unavaible, exiting");
                    throw new Error();
                default:
                    console.debug(
                        "Unsuported status code while pinging Ballchasing API, exiting",
                        ballchasingStatus,
                    );
                    throw new Error();
            }
        } catch (err) {
            throw new Error("An error occured while pinging ballchasing api", { cause: err });
        }

        let ballchasingId: string | undefined;
        if (config.inputMode === "BallchasingURL") {
            ballchasingId = config.inputPath!.split("/")[4];
        }
        if (config.inputMode === "Random") {
            // Find a replay -> need a new method in ballchasing class to handle that
        }
        if (ballchasingId === undefined) {
            throw new Error();
        }

        // DOWNLOADING REPLAY FILE
        console.info("Downloading replay file");
        let replay: { bin: Uint8Array; path: string | undefined };
        try {
            const { bin, path } = await ballchasing.downloadReplayFile(
                ballchasingId,
            );
            replay = {
                bin,
                path,
            };
            replayBin = bin;
        } catch (err) {
            console.error("An error occured while downloading replay file", err);
            throw new Error();
        }
        console.debug("Downloaded replay file", {
            bin: !!replay.bin,
            path: replay.path,
        });
    }
    if (config.inputMode === "FilePath") {} // TODO
    if (config.inputMode === "stdin") {} // TODO
    if (!replayBin) {
        throw new Error("An error occured we don't have any binaries :'(");
    }

    // STEP 4 -> DECODING REPLAY FILE
    console.info("Decoding replay binaries");
    let replayJson: Replay;
    try {
        replayJson = await rattletrap.decode(replayBin) as Replay;
    } catch (err) {
        console.error("An error occured while decoding replay binaries", err);
        throw new Error();
    }
    console.debug("Decoded replay binary");

    // STEP 5 -> PROMPT USER TO CHOOSE THE PLAYER TO GUESS !!FIXME!! + use cliffy prompt lib + should create the playerMap
    // async function selectPlayer(
    //     rl: readline.Interface,
    //     playersNames: string[],
    // ): Promise<string> {
    //     const answer = await rl.question(
    //         `Which player should be guessed ?\n  - Orange team :${
    //             replayInfo.getPlayers().orange.map((p: Player) => " " + p.name)
    //         }\n  - Blue team :${replayInfo.getPlayers().blue.map((p: Player) => " " + p.name)}\n`,
    //     );
    //     if (
    //         playersNames.find((p: string) => p.toLowerCase() === answer.toLowerCase()) === undefined
    //     ) {
    //         Deno.stdout.writeSync(
    //             new TextEncoder().encode(
    //                 `\nPlayer ${answer} is not part of either team`,
    //             ),
    //         );
    //         await selectPlayer(rl, playersNames);
    //     }
    //     return playersNames.find((
    //         p: string,
    //     ) => p.toLowerCase() === answer.toLowerCase())!;
    // }

    // let playerToGuess: string;
    // const rl = readline.createInterface({ input, output });
    // try {
    //     playerToGuess = await selectPlayer(rl, replayInfo.getPlayersName());
    // } catch (err) {
    //     console.error("An error occured while prompting user", err);
    //     rl.close();
    //     Deno.exit(1);
    // }
    // rl.close();
    // console.debug("Selected player to guess", playerToGuess);

    // STEP 6 -> ANONYMISE REPLAY
    // console.info("Anonymising replay");
    // replayJson = anonymiser(replayJson, "TESTREPLAYNAME", playerToGuess);

    // STEP 7 -> REENCODE REPLAY FILE
    // console.info("Encoding modified replay binaries");
    // try {
    //     await rattletrap.encode(replayJson, `${workdir}/modified-${ballchasingId}.replay`);
    // } catch (err) {
    //     console.error("An error occured while encodign replay binaries", err);
    // }
    // console.debug("Encoded replay binaries");

    // return;
}
