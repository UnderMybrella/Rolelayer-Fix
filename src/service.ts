import {RoleLayerBackground} from "./RoleLayerBackground";
import {DRMessage, DRMessageType} from "./DRMessage";

const browser = require("webextension-polyfill");

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
        case DRMessageType.SETTINGS_OPEN:
            return browser.runtime.openOptionsPage();

        case DRMessageType.RETRIEVE_PROFILE:
            return getCharacterProfile(message.character);

        case DRMessageType.RESOLVE_SPRITES:
            return Promise.reject(new Error("TODO"));
        case DRMessageType.GET_LIST_SPRITES:
            return Promise.reject(new Error("TODO"));

        case DRMessageType.ROLE_EXISTS:
            return RoleLayerBackground.roleExists(message.key);
        case DRMessageType.GET_ROLE:
            return RoleLayerBackground.getRole(message.key);
        case DRMessageType.ADD_ROLE:
            return RoleLayerBackground.addRole(message.key, message.role);
        case DRMessageType.REMOVE_ROLE:
            return RoleLayerBackground.removeRole(message.key);

        default:
            const _exhaustiveCheck: never = message;

            return Promise.reject(new Error(`Unknown message ${JSON.stringify(message)}`));
    }
});

async function getCharacterProfile(character: string) {
    character = normaliseCharacterName(character);
    const key = `profile_${character}`;

    const cache = await browser.storage.sync.get(key);
    if (cache && key in cache) return cache[key];
}