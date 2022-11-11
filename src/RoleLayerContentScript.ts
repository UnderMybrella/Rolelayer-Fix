import {DRFlairList, DRRole, DRSpriteList, RoleLayer} from "./RoleLayer";

export interface RoleLayerContentScript extends RoleLayer {
    prepareButtonMenu(target: Node): Promise<HTMLDivElement>
    prepareModal(): Promise<HTMLDivElement>
}

export const RoleLayerContentScript: RoleLayerContentScript = {
    async prepareButtonMenu(target: Node): Promise<HTMLDivElement> {
        return null;
    },

    async prepareModal(): Promise<HTMLDivElement> {
        return null;
    },

    async roleExists(key: string): Promise<boolean> {
        return true;
    },

    async getRole(key: string): Promise<DRRole> {
        return null;
    },

    async addRole(key: string, role: DRRole): Promise<DRRole> {
        return null;
    },
    async createAndAddRole(key: string, name: string, sprites: DRSpriteList, flairs: DRFlairList): Promise<DRRole> {
        return null;
    },

    async removeRole(key: string): Promise<DRRole> {
        return null;
    },
}