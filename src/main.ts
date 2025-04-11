import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as JSON from "npm:ts-typed-json";

import { Ballchasing } from "./ballchasing.ts";
import { Rattletrap } from "./rattletrap.ts";
import { Player, Replay } from "./replay.ts";
import Anyonymiser from "./anonymiser.ts";

export default async function (
  ballchasingId: string,
  ballchasingToken: string,
  debug: boolean = false,
) {
  const workdir = `replays/${ballchasingId}`;
  const rattletrap = new Rattletrap(workdir, debug);
  const ballchasing = new Ballchasing(ballchasingToken, workdir, debug);

  // STEP 1 -> INSTALL RATTLETRAP
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
        `Invalid Rattletrap version, expected version ${rattletrap.version} but got version ${currentRattletrapVersion}, updating/downgrading Rattletrap ...`,
      );
      Deno.removeSync(rattletrap.path);
      await rattletrap.downloadRattletrap();
    }
  } catch (err) {
    console.error(
      "An error occured while checking or installing Rattletrap",
      err,
    );
    Deno.exit(1);
  } finally {
    console.debug(
      "Final Rattletrap version check in case an installation occured",
    );
    const currentRattletrapVersion = await rattletrap
      .checkRattletrapVersion();

    if (
      currentRattletrapVersion == null ||
      rattletrap.version != currentRattletrapVersion
    ) {
      console.error(
        "Rattletrap version doesn't match the required version, exiting",
      );
      Deno.exit(1);
    } else {
      console.debug(
        `Rattletrap is up to date with version ${currentRattletrapVersion}`,
      );
    }
  }

  // STEP 2 -> CHECK BALLCHASING API AVAIBILITY
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
        Deno.exit(0);
        break;
      case 500:
        console.error("Ballchasing API is unavaible, exiting");
        Deno.exit(0);
        break;
      default:
        console.debug(
          "Unsuported status code while pinging Ballchasing API, exiting",
          ballchasingStatus,
        );
        Deno.exit(0);
        break;
    }
  } catch (err) {
    console.error("An error occured while pinging ballchasing api", err);
    Deno.exit(1);
  }

  // STEP 3 -> CREATE WORK DIRECTORY
  console.info("Create work directory to store logs and replays");
  try {
    Deno.mkdirSync(workdir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      console.error(err);
      Deno.exit(1);
    } else {
      console.debug("Dir already exist.", workdir);
    }
  }

  // STEP 4 -> FETCH REPLAY INFORMATIONS FROM BALLCHASING
  console.info("Fetching replay informations");
  let replayInfo: Replay;
  try {
    replayInfo = new Replay(await ballchasing.getReplayInfo(ballchasingId));
  } catch (err) {
    console.error(
      "An error occured while fetching replay informations",
      err,
    );
    Deno.exit(1);
  }

  // STEP 5 -> PROMPT USER TO CHOOSE THE PLAYER TO GUESS
  async function selectPlayer(
    rl: readline.Interface,
    playersNames: string[],
  ): Promise<string> {
    const answer = await rl.question(
      `Which player should be guessed ?\n  - Orange team :${
        replayInfo.getPlayers().orange.map((p: Player) => " " + p.name)
      }\n  - Blue team :${
        replayInfo.getPlayers().blue.map((p: Player) => " " + p.name)
      }\n`,
    );
    if (
      playersNames.find((p: string) =>
        p.toLowerCase() === answer.toLowerCase()
      ) === undefined
    ) {
      Deno.stdout.writeSync(
        new TextEncoder().encode(
          `\nPlayer ${answer} is not part of either team`,
        ),
      );
      await selectPlayer(rl, playersNames);
    }
    return playersNames.find((
      p: string,
    ) => p.toLowerCase() === answer.toLowerCase())!;
  }

  let playerToGuess: string;
  const rl = readline.createInterface({ input, output });
  try {
    playerToGuess = await selectPlayer(rl, replayInfo.getPlayersName());
  } catch (err) {
    console.error("An error occured while prompting user", err);
    rl.close();
    Deno.exit(1);
  }
  rl.close();
  console.debug("Selected player to guess", playerToGuess);

  // STEP 6 -> DOWNLOADING REPLAY FILE
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
  } catch (err) {
    console.error("An error occured while downloading replay file", err);
    Deno.exit(1);
  }
  console.debug("Downloaded replay file", {
    bin: !!replay.bin,
    path: replay.path,
  });

  // STEP 7 -> DECODING REPLAY FILE
  console.info("Decoding replay binaries");
  // deno-lint-ignore no-explicit-any
  let replayJson: any;
  try {
    replayJson = await rattletrap.decodeByBin(replay.bin);
  } catch (err) {
    console.error("An error occured while decoding replay binaries", err);
    Deno.exit(1);
  }
  console.debug("Decoded replay binary");

  // STEP 8 -> ANONYMISE REPLAY
  console.info("Anonymising replay");
  const anonymiser = new Anyonymiser(
    playerToGuess,
    "GuessTheGuest#xx",
    debug,
  );
  console.log(Object.keys(replayJson));
  anonymiser.header(replayJson.header);

  // STEP 9 -> REENCODE REPLAY FILE

  // STEP 10 -> PRODUCE TEXT FILE WITH REPLAY INFORMATIONS

  return;
}
