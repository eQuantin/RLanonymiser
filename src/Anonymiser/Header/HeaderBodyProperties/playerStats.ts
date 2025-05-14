import { ArrayValue, PropertieValue, Property } from "./abstractProperty.ts";

const StatKeys = {
    Name: "Name",
    Platform: "Platform",
    OnlineID: "OnlineID",
    Team: "Team",
    Score: "Score",
    Goals: "Goals",
    Assists: "Assists",
    Saves: "Saves",
    Shots: "Shots",
    bBot: "bBot",
    PlayerID: "PlayerID",
} as const;

type StatKeys = typeof StatKeys[keyof typeof StatKeys];

type StatArray = [
    StatKeys,
    PropertieValue<any>,
];

type PlayerStats = ArrayValue<StatArray>;

export default class PlayerStatsAnonymiser extends Property<PlayerStats> {
    anonymise() {
        this.value.array = this.value.array.map((stat) => {
            const elements: Map<StatKeys, PropertieValue<any>> = new Map(stat.elements.map((arr) => [arr[0], arr[1]]));

            elements.forEach((value, key) => {
                switch (key) {
                    case StatKeys.Name: {
                        elements.set(key, NameKey(value, replayConfig));
                        break;
                    }
                    case StatKeys.Platform: {
                        elements.set(key, PlatformKey(value));
                        break;
                    }
                    case StatKeys.OnlineID: {
                        elements.set(key, OnlineIDKey(value));
                        break;
                    }
                    case StatKeys.bBot: {
                        elements.set(key, bBotKey(value));
                        break;
                    }
                    case StatKeys.PlayerID: {
                        elements.set(key, PlayerIdKey(value));
                        break;
                    }
                    default:
                        break;
                }
            });
            return {
                elements: Array.from(elements),
                last_key: stat.last_key,
            };
        });
        return {
            index: this.index,
            kind: this.kind,
            size: this.size,
            value: this.value,
        };
    }

    computeSize(): number {
        return this.size;
    }
}
