import anonymiseLoadout from "../anonymiseLoadout.ts";
import generatePlayerName from "../../players.ts";

type ReplicatedValue = {
    id: {
        limit: number;
        value: number;
    };
    name: string;
    value: any;
};

type FrameReplication = {
    actor_id: {
        limit: number;
        value: number;
    };
    value: {
        updated?: ReplicatedValue[];
        spawned?: ReplicatedValue[];
        destroyed?: [];
    };
};

export type Frame = {
    delta: number;
    replications: FrameReplication[];
    time: number;
};

export default (frames: Frame[], guestName: string): Frame[] => {
    for (const frame of frames) {
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
                        const playerInfo = generatePlayerName(
                            entry.value.string,
                            guestName,
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
                        anonymiseLoadout(entry);
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

    return frames;
};
