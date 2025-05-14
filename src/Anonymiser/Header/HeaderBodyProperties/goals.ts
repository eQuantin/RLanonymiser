import { ReplayConfig } from "../../abstractAnonymiser.ts";
import { ArrayValue, IntValue, PropertieValue, Property, StrValue } from "../HeaderBodyProperties/abstractProperty.ts";

const GoalKeys = {
    Frame: "frame",
    PlayerName: "PlayerName",
    PlayerTeam: "PlayerTeam",
} as const;

type GoalKeys = typeof GoalKeys[keyof typeof GoalKeys];

type GoalProperties = IntValue | StrValue;

type GoalsArray = [
    GoalKeys,
    PropertieValue<GoalProperties>,
];

export type Goals = ArrayValue<GoalsArray>;

export default class GoalsAnonymiser extends Property<Goals> {
    constructor(element: PropertieValue<Goals>, replayConfig: ReplayConfig) {
        super(element, replayConfig);
    }

    anonymise() {
        this.value.array = this.value.array.map((goal) => {
            const elements: Map<GoalKeys, PropertieValue<GoalProperties>> = new Map(
                goal.elements.map((arr) => [arr[0], arr[1]]),
            );

            elements.forEach((value, key) => {
                switch (key) {
                    case GoalKeys.PlayerName: {
                        elements.set(key, this.anonymisePlayerName(value, this.replayConfig));
                        break;
                    }
                    default:
                        break;
                }
            });

            return {
                elements: Array.from(elements),
                last_key: goal.last_key,
            };
        });

        return {
            index: this.index,
            kind: this.kind,
            size: this.size,
            value: this.value,
        };
    }

    public override updateSize(): void {
        throw new Error("Method not implemented.");
    }

    computeSize(): number {
        return this.size;
    }
}
