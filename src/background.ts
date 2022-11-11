const browser = require("webextension-polyfill");

import {DRMessage, OpenSettings} from "./DRMessage";

const CHARACTER_MAP = {
    celestia: "celes",
    fujisaki: "chihiro",
    hagakure: "yasuhiro",
    ishimaru: "kiyotaka",
    kyoko: "kyouko",
    maizono: "sayaka",
    monokuma2: "monokuma",
    ikusaba: "mukuro",
    naegi: "makoto",
    toko: "touko",
    gundam: "gundham",
    hanamura: "teruteru",
    hinata: "hajime",
    koizumi: "mahiru",
    kuzuryuu: "fuyuhiko",
    nanami: "chiaki",
    nidaii: "nekomaru",
    pekoyama: "peko",
    saionji: "hiyoko",
    souda: "kazuichi",
    togami: "imposter",
    tsumiki: "mikan"
}

function normaliseCharacterName(name: string): string {
    name = name.toLowerCase();
    name = name.split("-")[0];

    if (name in CHARACTER_MAP) name = CHARACTER_MAP[name];

    return name;
}

browser.runtime.onMessage.addListener(async (message: DRMessage, sender: any) => {
    switch (message.type) {
        case "SETTINGS_OPEN":
            return browser.runtime.openOptionsPage();

        case "PROFILE_RETRIEVE":
            return getCharacterProfile(message.character);

        case "SPRITES_RESOLVE":
            return Promise.reject(new Error("TODO"));
        case "SPRITES_GETLIST":
            return Promise.reject(new Error("TODO"));

        default:
            const _exhaustiveCheck: never = message;

            return Promise.reject(new Error(`Unknown message ${message}`));
    }
});

async function getCharacterProfile(character: string) {
    character = normaliseCharacterName(character);
    const key = `profile_${character}`;

    const cache = await browser.storage.sync.get(key);
    if (cache && key in cache) return cache[key];
}