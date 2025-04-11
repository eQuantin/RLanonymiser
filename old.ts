import { Buffer } from "node:buffer";
import process from "node:process";

/**
 *  TODO
 *  Fix player view bug
 *  Automate retrieving the replay from a ballchasing url and prompt user to choose the Guest
 *  Add some failsafe check and input sanitization
 */

const args = process.argv.splice(2);
const guestName = args[0];
const replayName = args[1];

let rawJson = "";

process.stdin.on("data", (data) => {
    rawJson += data.toString();
});

process.stdin.on("end", () => {
    let json;
    try {
        json = JSON.parse(rawJson);
    } catch (e) {
        throw e;
    } finally {
        // Deno.writeFileSync("./logs.json", Buffer.from(rawJson));
        AnonymisePlayers(json);
        Deno.writeFileSync(
            "./modified.json",
            Buffer.from(JSON.stringify(json)),
        );
        Deno.stdout.write(Buffer.from(JSON.stringify(json)));
    }
});

const botNames: {
    name: string;
    botProductName: number;
    savedPlayer: string | null;
    changed: number;
}[] = [
    "Armstrong",
    "Bandit",
    "Beast",
    "Boomer",
    "Buzz",
    "Casper",
    "Caveman",
    "C-Block",
    "Centice",
    "Chipper",
    "Cougar",
    "Dude",
    "Foamer",
    "Fury",
    "Gerwin",
    "Goose",
    "Heater",
    "Hollywood",
    "Hound",
    "Iceman",
    "Imp",
    "Jester",
    "Junker",
    "Khan",
    "Maverick",
    "Middy",
    "Merlin",
    "Mountain",
    "Myrtle",
    "Outlaw",
    "Poncho",
    "Rainmaker",
    "Raja",
    "Rex",
    "Roundhouse",
    "Sabretooth",
    "Saltie",
    "Samara",
    "Scout",
    "Shepard",
    "Slider",
    "Squall",
    "Sticks",
    "Stinger",
    "Storm",
    "Sundown",
    "Sultan",
    "Swabbie",
    "Tusk",
    "Tex",
    "Viper",
    "Wolfman",
    "Yuri",
].map((name, index) => ({
    name,
    botProductName: index + 1000,
    savedPlayer: null,
    changed: 0,
}));

const date = new Date();
const replayDate = `${date.getFullYear()}-${
    date.getMonth() + 1
}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

function GeneratePlayerName(
    playerName: string,
): { name: string; botProductName: number | null } {
    if (playerName == undefined) {
        throw new Error("PlayerName is undefined");
    }

    const playerIndex = botNames.findIndex((x) => x.savedPlayer == playerName);
    const player = botNames[playerIndex];
    if (playerIndex == -1) {
        const random = Math.floor(
            Math.random() *
                (botNames.filter((x) => x.savedPlayer == null).length),
        );
        const nameIndex = botNames.findIndex((y) =>
            y.name == botNames.filter((x) => x.savedPlayer == null)[random].name
        );
        botNames[nameIndex].savedPlayer = playerName;
        botNames[nameIndex].changed++;
        return guestName !== null && playerName == guestName
            ? { name: "Guest", botProductName: 999 }
            : {
                name: botNames[nameIndex].name,
                botProductName: botNames[nameIndex].botProductName,
            };
    } else {
        botNames[playerIndex].changed++;
        return guestName !== null && playerName == guestName
            ? { name: "Guest", botProductName: 999 }
            : { name: player.name, botProductName: player.botProductName };
    }
}

// deno-lint-ignore no-explicit-any
function AnonymiseLoadout(entry: any): void {
    entry["value"]["loadouts"]["blue"]["antenna"] = 0;
    entry["value"]["loadouts"]["blue"]["decal"] = 0;
    entry["value"]["loadouts"]["blue"]["engine_audio"] = 0;
    entry["value"]["loadouts"]["blue"]["topper"] = 0;
    entry["value"]["loadouts"]["blue"]["body"] = 23;
    entry["value"]["loadouts"]["blue"]["goal_explosion"] = 1903;
    entry["value"]["loadouts"]["blue"]["rocket_trail"] = 63;
    entry["value"]["loadouts"]["blue"]["trail"] = 1948;
    entry["value"]["loadouts"]["blue"]["wheels"] = 363;
    entry["value"]["loadouts"]["blue"]["version"] = 28;
    entry["value"]["loadouts"]["blue"]["unknown1"] = 0;
    entry["value"]["loadouts"]["blue"]["unknown2"] = 0;
    entry["value"]["loadouts"]["blue"]["unknown3"] = 6153;
    entry["value"]["loadouts"]["blue"]["unknown4"] = 0;
    entry["value"]["loadouts"]["blue"]["unknown5"] = 3270;
    entry["value"]["loadouts"]["blue"]["unknown6"] = 0;
    // Orange
    entry["value"]["loadouts"]["orange"]["antenna"] = 0;
    entry["value"]["loadouts"]["orange"]["decal"] = 0;
    entry["value"]["loadouts"]["orange"]["engine_audio"] = 0;
    entry["value"]["loadouts"]["orange"]["topper"] = 0;
    entry["value"]["loadouts"]["orange"]["body"] = 23;
    entry["value"]["loadouts"]["orange"]["goal_explosion"] = 1903;
    entry["value"]["loadouts"]["orange"]["rocket_trail"] = 63;
    entry["value"]["loadouts"]["orange"]["trail"] = 1948;
    entry["value"]["loadouts"]["orange"]["wheels"] = 363;
    entry["value"]["loadouts"]["orange"]["version"] = 28;
    entry["value"]["loadouts"]["orange"]["unknown1"] = 0;
    entry["value"]["loadouts"]["orange"]["unknown2"] = 0;
    entry["value"]["loadouts"]["orange"]["unknown3"] = 6153;
    entry["value"]["loadouts"]["orange"]["unknown4"] = 0;
    entry["value"]["loadouts"]["orange"]["unknown5"] = 3270;
    entry["value"]["loadouts"]["orange"]["unknown6"] = 0;
}

// deno-lint-ignore no-explicit-any
function AnonymisePlayers(json: any) {
    json.content.body.key_frames = [json.content.body.key_frames[0]];
    for (const frame of json.content.body.frames) {
        for (const replication of frame.replications) {
            const value = replication.value.spawned ||
                replication.value.updated;
            if (value == null) continue;

            if (value instanceof Array) {
                const indexToSplice: number[] = [];
                let botProductName: number | null = null;
                value.forEach((entry, index) => {
                    if (
                        entry.name == "ProjectX.GRI_X:Reservations" ||
                        entry.name ==
                            "Engine.PlayerReplicationInfo:UniqueId" ||
                        entry.name == "Engine.PlayerReplicationInfo:Ping" ||
                        entry.name == "TAGame.PRI_TA:PartyLeader" ||
                        entry.name == "TAGame.PRI_TA:SteeringSensitivity" ||
                        entry.name == "TAGame.PRI_TA:Title" ||
                        entry.name == "Engine.PlayerReplicationInfo:PlayerID"
                    ) {
                        indexToSplice.push(index);
                    }
                    if (
                        entry.name ==
                            "Engine.PlayerReplicationInfo:PlayerName"
                    ) {
                        const playerInfo = GeneratePlayerName(
                            entry.value.string,
                        );
                        entry.value.string = playerInfo.name;
                        botProductName = playerInfo.botProductName;
                    }
                    if (entry.name == "TAGame.Car_TA:TeamPaint") {
                        entry.value.team_paint.accent_color = 90;
                        entry.value.team_paint.accent_finish = 270;
                        entry.value.team_paint.primary_color = 42;
                        entry.value.team_paint.primary_finish = 270;
                    }
                    if (
                        entry.name == "TAGame.PRI_TA:ClientLoadoutsOnline"
                    ) {
                        entry.value.loadouts_online.blue = [
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                        ];
                        entry.value.loadouts_online.orange = [
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                        ];
                    }
                    if (
                        entry.name == "TAGame.PRI_TA:ClientLoadouts"
                    ) {
                        // const loadout = {
                        //     antenna: 0,
                        //     decal: 0,
                        //     engine_audio: 0,
                        //     topper: 0,
                        //     body: 23,
                        //     goal_explosion: 1903,
                        //     rocket_trail: 63,
                        //     trail: 1948,
                        //     wheels: 363,
                        //     version: 28,
                        //     unknown1: 0,
                        //     unknown2: 0,
                        //     unknown3: 6153,
                        //     unknown4: 0,
                        //     unknown5: 3270,
                        //     unknown6: 0
                        // }
                        // entry.value.loadouts.blue = loadout;
                        // entry.value.loadouts.orange = loadout;
                        AnonymiseLoadout(entry);
                    }
                    if (
                        entry.name ==
                            "TAGame.CameraSettingsActor_TA:ProfileSettings"
                    ) {
                        entry.value.cam_settings = {
                            "angle": -3,
                            "distance": 260,
                            "fov": 110,
                            "height": 100,
                            "stiffness": 0.35,
                            "swivel_speed": 5,
                            "transition_speed": 1.2,
                        };
                    }
                });

                let j = 0;
                for (let i of indexToSplice) {
                    i -= j;
                    value.splice(i, 1);
                    j++;
                }

                if (botProductName !== null) {
                    value.push({
                        "id": {
                            "limit": 111,
                            "value": 25,
                        },
                        "name": "Engine.PlayerReplicationInfo:bBot",
                        "value": {
                            "boolean": true,
                        },
                    });

                    value.push({
                        "id": {
                            "limit": 111,
                            "value": 48,
                        },
                        "name": "TAGame.PRI_TA:BotProductName",
                        "value": {
                            "int": botProductName,
                        },
                    });
                }
            }
        }
    }

    for (const element of json.header.body.properties.elements) {
        if (element[0] == "Goals") {
            for (const goal of element[1].value.array) {
                for (const key of goal.elements) {
                    if (key[0] == "PlayerName") {
                        const newPlayerInfo = GeneratePlayerName(
                            key[1].value.str,
                        );
                        key[1].value.str = newPlayerInfo.name;
                        key[1].size = newPlayerInfo.name.length;
                    }
                }
            }
        }

        if (element[0] == "PlayerStats") {
            for (const stat of element[1].value.array) {
                for (const key of stat.elements) {
                    if (key[0] == "PlayerID") {
                        for (
                            const field of key[1].value.struct.fields.elements
                        ) {
                            if (field[0] == "Uid") {
                                field[1].value.q_word = "0";
                            }
                            if (field[0] == "NpId") {
                                for (
                                    const struct of field[1].value.struct.fields
                                        .elements
                                ) {
                                    if (struct[0] == "Handle") {
                                        for (
                                            const handle of struct[1].value
                                                .struct.fields.elements
                                        ) {
                                            if (handle[0] == "Data") {
                                                handle[1].value.q_word = "0";
                                            }
                                        }
                                    }
                                    if (struct[0] == "Opt") {
                                        struct[1].value.q_word = "0";
                                    }
                                    if (struct[0] == "Reserved") {
                                        struct[1].value.q_word = "0";
                                    }
                                }
                            }
                            if (field[0] == "EpicAccountId") {
                                field[1].value.str = "";
                            }
                            if (field[0] == "Platform") {
                                field[1] = {
                                    "index": 0,
                                    "kind": "ByteProperty",
                                    "size": 27,
                                    "value": {
                                        "byte": [
                                            "OnlinePlatform",
                                            {
                                                "Right":
                                                    "OnlinePlatform_Unknown",
                                            },
                                        ],
                                    },
                                };
                            }
                        }
                    }

                    if (key[0] == "Name") {
                        const newPlayerInfo = GeneratePlayerName(
                            key[1].value.str,
                        );
                        key[1].value.str = newPlayerInfo.name;
                        key[1].size = newPlayerInfo.name.length;
                    }

                    if (key[0] == "Platform") {
                        key[1] = {
                            "index": 0,
                            "kind": "ByteProperty",
                            "size": 27,
                            "value": {
                                "byte": [
                                    "OnlinePlatform",
                                    {
                                        "Right": "OnlinePlatform_Unknown",
                                    },
                                ],
                            },
                        };
                    }

                    if (key[0] == "OnlineID") {
                        key[1] = {
                            "index": 0,
                            "kind": "QWordProperty",
                            "size": 8,
                            "value": {
                                "q_word": "0",
                            },
                        };
                    }

                    if (key[0] == "bBot") {
                        key[1] = {
                            "index": 0,
                            "kind": "BoolProperty",
                            "size": 0,
                            "value": {
                                "bool": 1,
                            },
                        };
                    }
                }
            }
        }

        if (element[0] == "ReplayName") {
            element[1].value.str = replayName || "Guess the Guest #XX";
            element[1].size = element[1].value.str.length;
        }

        if (element[0] == "MatchStartEpoch") {
            element[1].value.q_word = date.getTime().toString().slice(0, 10);
        }

        if (element[0] == "Date") {
            element[1].value.str = replayDate;
        }
    }

    const addedSize = botNames.map((x) =>
        (x.savedPlayer !== null
            ? x.savedPlayer.length - x.name.length
            : x.name.length) * x.changed
    ).reduce((x, y) => x + y);
    json.content.body.stream_size += addedSize * 2;
    json.content.size += addedSize * 2;

    json.content.body.messages = [];
}
