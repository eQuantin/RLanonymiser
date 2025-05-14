import { Players } from "../players.ts";

export type ReplayConfig = {
    replayName: string;
    players: Players;
    date: Date;
};

export default abstract class AbstractAnonymiser<T> {
    protected readonly replayConfig: ReplayConfig;

    // Size tracking
    public readonly originalSize!: number;
    private _size!: number;
    public get size(): number {
        return this._size;
    }
    public set size(size: number) {
        this._size = size;
    }

    constructor(replayConfig: ReplayConfig, originalSize: number) {
        this.replayConfig = replayConfig;
        this.originalSize = originalSize;
        this._size = originalSize;
    }

    public abstract anonymise(): void;
    public abstract convert(): T;
    public abstract updateSize(): void;

    public getSizeDifference(): number {
        return this._size - this.originalSize;
    }
}
