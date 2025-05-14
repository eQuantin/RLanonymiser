import PlayerStatsKey from "../playerStatsProperties.ts";
import { findOptionnalKeys, findUnknownKeys } from "../../utils.ts";
import { PropertieValue, Property, ValueKind } from "./abstractProperty.ts";
import ReplayNameAnonymiser from "./replayName.ts";
import MatchStartEpochAnonymiser from "./matchStartEpoch.ts";
import DateAnonymiser from "./date.ts";
import PlayerStatsAnonymiser from "./playerStats.ts";
import AbstractAnonymiser, { ReplayConfig } from "../../abstractAnonymiser.ts";
import GoalsAnonymiser from "./goals.ts";

enum PropertiesKeys {
    Date = "Date", //Implemented
    Goals = "Goals", //Implemented
    Id = "Id",
    KeyframeDelay = "KeyframeDelay",
    MapName = "MapName",
    MatchType = "MatchType",
    MaxChannels = "MaxChannels",
    MaxReplaySizeMB = "MaxReplaySizeMB",
    NumFrames = "NumFrames",
    PlayerName = "PlayerName", // Implemented
    PlayerStats = "PlayerStats", // Implemented
    RecordFPS = "RecordFPS",
    TeamSize = "TeamSize",

    BuildID = "BuildID", // Optionnal
    BuildVersion = "BuildVersion", // Optionnal
    Changelist = "Changelist", // Optionnal
    GameVersion = "GameVersion", // Optionnal
    HighLights = "HighLights", // Optionnal
    MatchGuid = "MatchGuid", // Optionnal
    MatchStartEpoch = "MatchStartEpoch", // Optionnal - Implemented
    PrimaryPlayerTeam = "PrimaryPlayerTeam", // Optionnal
    ReplayLastSaveVersion = "ReplayLastSaveVersion", // Optionnal
    ReplayName = "ReplayName", // Optionnal - Implemented
    ReplayVersion = "ReplayVersion", // Optionnal
    ReserveMegabytes = "ReserveMegabytes", // Optionnal
    Team0Score = "Team0Score", // Optionnal
    Team1Score = "Team1Score", // Optionnal
    TotalSecondsPlayed = "TotalSecondsPlayed", // Optionnal
    UnfairTeamSize = "UnfairTeamSize", // Optionnal
}

export type HeaderBodyProperties = {
    elements: [PropertiesKeys, PropertieValue<any>][];
    last_key: string;
};

export default class HeaderBodyPropertiesAnonymiser extends AbstractAnonymiser<HeaderBodyProperties> {
    // Data
    private elements: Map<PropertiesKeys, PropertieValue<any>>;
    private readonly last_key: string;

    // Anonymisers
    private anonymisers: Map<PropertiesKeys, Property<any>> = new Map();

    constructor(headerBodyProperties: HeaderBodyProperties, replayConfig: ReplayConfig) {
        super(replayConfig, 0);

        this.elements = new Map(
            headerBodyProperties.elements.map((arr) => [arr[0], arr[1]]),
        );
        this.last_key = headerBodyProperties.last_key;

        for (const [key, value] of this.elements.entries()) {
            switch (key) {
                case PropertiesKeys.Goals: {
                    this.anonymisers.set(key, new GoalsAnonymiser(value, this.replayConfig));
                    break;
                }
                case PropertiesKeys.PlayerStats: {
                    this.anonymisers.set(key, new PlayerStatsAnonymiser(value, this.replayConfig));
                    break;
                }
                case PropertiesKeys.ReplayName: {
                    this.anonymisers.set(key, new ReplayNameAnonymiser(value, this.replayConfig));
                    break;
                }
                case PropertiesKeys.MatchStartEpoch: {
                    this.anonymisers.set(key, new MatchStartEpochAnonymiser(value, this.replayConfig));
                    break;
                }
                case PropertiesKeys.Date: {
                    this.anonymisers.set(key, new DateAnonymiser(value, this.replayConfig));
                    break;
                }
                default:
                    break;
            }
        }
    }

    private ensureReplayNameExists(): void {
        if (!this.anonymisers.has(PropertiesKeys.ReplayName)) {
            const replayNameDefaultValues = {
                index: 0,
                kind: ValueKind.StrProperty,
                size: 0,
                value: {
                    str: "",
                },
            };
            this.anonymisers.set(
                PropertiesKeys.ReplayName,
                new ReplayNameAnonymiser(replayNameDefaultValues, this.replayConfig),
            );
        }
    }

    public anonymise(): void {
        this.anonymisers.forEach((value, key) => {
            value.anonymise();
            this.elements.set(key, value.convert());
        });

        this.ensureReplayNameExists();
        this.updateSize();
    }

    public updateSize(): void {
        let newSize = this.originalSize;
        this.anonymisers.forEach((value) => {
            newSize += value.getSizeDifference();
        });
        this.size = newSize;
    }

    public convert(): HeaderBodyProperties {
        return {
            elements: Array.from(this.elements),
            last_key: this.last_key,
        };
    }

    public devTools(): void {
        findUnknownKeys(this.elements, Object.values(PropertiesKeys), "Unknown HeaderBodyProperties keys");
        findOptionnalKeys(this.elements, Object.values(PropertiesKeys), "Optionnal HeaderBodyProperties keys");
    }
}
