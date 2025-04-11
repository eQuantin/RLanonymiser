import {
    Header,
    HeaderBodyProperties,
    HeaderBodyPropertiesKeys,
} from "./anonymiser.d.ts";
import bots from "./bots.ts";

export default class Anyonymiser {
    private botNames: {
        name: string;
        botProductName: number;
        savedPlayer: string | null;
        changed: number;
    }[] = bots.map((name, index) => ({
        name,
        botProductName: index + 1000,
        savedPlayer: null,
        changed: 0,
    }));

    constructor(
        private guestName: string,
        private replayName: string,
        private debug: boolean = false,
    ) {}

    private generatePlayerName(
        playerName: string,
    ): { name: string; botProductName: number | null } {
        if (playerName == undefined) {
            throw new Error("PlayerName is undefined");
        }

        const playerIndex = this.botNames.findIndex((x) =>
            x.savedPlayer == playerName
        );
        const player = this.botNames[playerIndex];
        if (playerIndex == -1) {
            const random = Math.floor(
                Math.random() *
                    (this.botNames.filter((x) => x.savedPlayer == null).length),
            );
            const nameIndex = this.botNames.findIndex((y) =>
                y.name ==
                    this.botNames.filter((x) => x.savedPlayer == null)[random]
                        .name
            );
            this.botNames[nameIndex].savedPlayer = playerName;
            this.botNames[nameIndex].changed++;
            return this.guestName !== null && playerName == this.guestName
                ? { name: "Guest", botProductName: 999 }
                : {
                    name: this.botNames[nameIndex].name,
                    botProductName: this.botNames[nameIndex].botProductName,
                };
        } else {
            this.botNames[playerIndex].changed++;
            return this.guestName !== null && playerName == this.guestName
                ? { name: "Guest", botProductName: 999 }
                : { name: player.name, botProductName: player.botProductName };
        }
    }

    // deno-lint-ignore no-explicit-any
    private anonymiseLoadout(entry: any): void {
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
    private clearKeyFrames(key_frames: any[]): any[] {
        return [key_frames[0]];
    }

    private anonymiseGoals(element: any): void {
        for (const goal of element.value.array) {
            for (const key of goal.elements) {
                if (key[0] == "PlayerName") {
                    const newPlayerInfo = this.generatePlayerName(
                        key[1].value.str,
                    );
                    key[1].value.str = newPlayerInfo.name;
                    key[1].size = newPlayerInfo.name.length;
                }
            }
        }
    }

    private anonymisePlayerStats(element: any): void {
        for (const stat of element.value.array) {
            for (const key of stat.elements) {
                if (key[0] == "PlayerID") {
                    for (
                        const field of key[1].value.struct.fields
                            .elements
                    ) {
                        if (field[0] == "Uid") {
                            field[1].value.q_word = "0";
                        }
                        if (field[0] == "NpId") {
                            for (
                                const struct of field[1].value.struct
                                    .fields
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
                                            "Right": "OnlinePlatform_Unknown",
                                        },
                                    ],
                                },
                            };
                        }
                    }
                }

                if (key[0] == "Name") {
                    const newPlayerInfo = this.generatePlayerName(
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

    private headerBodyProperties(
        headerBodyProperties: HeaderBodyProperties,
    ): HeaderBodyProperties {
        const date = new Date();
        const elements = new Map(
            headerBodyProperties.elements.map((arr) => [arr[0], arr[1]]),
        );

        console.log(Array.from(elements.keys()));

        elements.forEach((element, key) => {
            switch (key) {
                case HeaderBodyPropertiesKeys.Goals: {
                    this.anonymiseGoals(element);
                    break;
                }
                case HeaderBodyPropertiesKeys.PlayerStats: {
                    this.anonymisePlayerStats(element);
                    break;
                }
                case HeaderBodyPropertiesKeys.ReplayName: { // Optionnal ? Could be a good idea in create the element
                    element.value.str = this.replayName;
                    element.size = element.value.str.length;
                    break;
                }
                case HeaderBodyPropertiesKeys.MatchStartEpoch: {
                    element.value.q_word = date.getTime().toString().slice(
                        0,
                        10,
                    );
                    break;
                }
                case HeaderBodyPropertiesKeys.Date: {
                    element.value.str = `${date.getFullYear()}-${
                        date.getMonth() + 1
                    }-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
                    break;
                }
                default: {
                    break;
                }
            }
        });
        return {
            elements: Array.from(elements),
            last_key: headerBodyProperties.last_key,
        };
    }

    header(header: Header): Header {
        // maybe a good idea to dig in the crc and size values to improve stability
        // in header.body we can ignore everything except properties
        header.body.properties = this.headerBodyProperties(
            header.body.properties,
        );
        return header;
    }

    // deno-lint-ignore no-explicit-any
    anonymiseBody(json: any): void {
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
                            entry.name ==
                                "Engine.PlayerReplicationInfo:PlayerID"
                        ) {
                            indexToSplice.push(index);
                        }
                        if (
                            entry.name ==
                                "Engine.PlayerReplicationInfo:PlayerName"
                        ) {
                            const playerInfo = this.generatePlayerName(
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
                            this.anonymiseLoadout(entry);
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

        const addedSize = this.botNames.map((x) =>
            (x.savedPlayer !== null
                ? x.savedPlayer.length - x.name.length
                : x.name.length) * x.changed
        ).reduce((x, y) => x + y);
        json.content.body.stream_size += addedSize * 2;
        json.content.size += addedSize * 2;

        json.content.body.messages = [];
    }
}
