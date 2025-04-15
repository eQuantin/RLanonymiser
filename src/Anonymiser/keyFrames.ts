export type KeyFrame = {
    frame: number;
    positions: number;
    time: number;
};

export default (key_frames: KeyFrame[]): KeyFrame[] => {
    /*  Clear all keyframes to avoid a crash from the replay due to a bug.
     *  It's likely that modifications to the replay chang the length of some of the frames
     *  and offset the key frames. Computing new offsets would be challenging.
     *  See https://github.com/tfausak/rattletrap/issues/154
     */
    return [key_frames[0]];
};
