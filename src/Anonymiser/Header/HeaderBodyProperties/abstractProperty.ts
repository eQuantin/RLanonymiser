import AbstractAnonymiser, { ReplayConfig } from "../../abstractAnonymiser.ts";

export const ValueKind = {
    IntProperty: "IntProperty",
    StrProperty: "StrProperty",
    BoolProperty: "BoolProperty",
    FloatProperty: "FloatProperty",
    QWordProperty: "QWordProperty",
    ByteProperty: "ByteProperty",
    ArrayProperty: "ArrayProperty",
    NameProperty: "NameProperty",
    StructProperty: "StructProperty",
} as const;

type ValueKind = typeof ValueKind[keyof typeof ValueKind];

export type PropertieValue<T> = {
    index: number;
    kind: ValueKind;
    size: number;
    value: T;
};

export type IntValue = { int: number };

export type StrValue = { str: string };

export type BoolValue = { bool: 0 | 1 };

export type FloatValue = {
    float: number;
};

export type QWordValue = {
    q_word: string;
};

export type ByteValue = {
    byte: any;
};

export type ArrayValue<T> = {
    array: {
        elements: T[];
        last_key: "None";
    }[];
};

export type NameValue = {
    name: string;
};

export type StructValue<T> = {
    struct: {
        fields: {
            elements: T[];
            last_key: "None";
        };
        name: string;
    };
};

export abstract class Property<T> extends AbstractAnonymiser<PropertieValue<T>> {
    // Data
    readonly index: number;
    readonly kind: ValueKind;
    private _value: T;
    public get value(): T {
        return this._value;
    }
    public set value(value: T) {
        this._value = value;
        this.size = this.computeSize();
    }

    constructor(element: PropertieValue<T>, replayConfig: ReplayConfig) {
        super(replayConfig, element.size);
        this.index = element.index;
        this.kind = element.kind;
        this._value = element.value;
    }

    public abstract computeSize(): number;

    public convert(): PropertieValue<T> {
        return {
            index: this.index,
            kind: this.kind,
            size: this.size,
            value: this.value,
        };
    }
}
