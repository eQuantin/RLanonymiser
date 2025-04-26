export type Player = {
    name: string;
    id: {
        epic: string | null;
        steam: string | null;
    };
};

const playerArray: Player[] = [
    {
        name: "Zen",
        id: {
            epic: null,
            steam: "76561198144145654",
        },
    },
    {
        name: "Radosin",
        id: {
            epic: null,
            steam: "76561199009010912",
        },
    },
    {
        name: "Exotiik",
        id: {
            epic: null,
            steam: "76561198258466111",
        },
    },
];

export default playerArray;
