const browser = require("webextension-polyfill");

import {DRFlairList, DRRole, DRCastList, DRSpriteList, RoleLayer} from "./RoleLayer";

export interface RoleLayerBackground extends RoleLayer {
    cast: Promise<DRCastList>
}

export const RoleLayerBackground: RoleLayerBackground = {
    cast: fetch("assets/json/cast.json")
        .then(response => response.json())
        .then(json => <DRCastList>json),

    async roleExists(key: string): Promise<boolean> {
        const cast: DRCastList = await this.cast;

        if (key in cast) return true;

        key = `custom_role_${key}.json`;
        return browser.storage.sync.get(key)
            .then(obj => Promise.resolve(key in obj));
    },

    async getRole(key: string): Promise<DRRole> {
        const cast: DRCastList = await this.cast;
        if (key in cast) return cast[key];

        const raw_key = key;
        key = `custom_role_${key}.json`;

        const obj = await browser.storage.sync.get(key);
        if (key in obj) return <DRRole>JSON.parse(obj[key]);

        return Promise.reject(new Error(`${raw_key} is not in cast!`));
    },

    addRole(key: string, role: DRRole): Promise<DRRole> {
        const obj = {};
        obj[`custom_role_${key}.json`] = JSON.stringify(role);

        return browser.storage.sync.set(obj)
            .then(() => role);
    },
    async createAndAddRole(key: string, name: string, sprites: DRSpriteList, flairs: DRFlairList): Promise<DRRole> {
        return null;
    },

    async removeRole(key: string): Promise<DRRole> {
        const raw_key = key;
        key = `custom_role_${key}.json`;

        const obj = await browser.storage.sync.get(key);
        if (key in obj) {
            await browser.storage.sync.remove(key);

            return <DRRole>JSON.parse(obj[key]);
        }

        return Promise.reject(new Error(`${raw_key} is not in cast!`));
    },
}