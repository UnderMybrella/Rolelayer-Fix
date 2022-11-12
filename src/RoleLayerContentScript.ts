import {DRFlairList, DRRole, DRSpriteList, RoleLayer} from "./RoleLayer";
import {sendAddRoleMessage, sendGetRoleMessage, sendRemoveRoleMessage, sendRoleExistsMessage} from "./DRMessage";

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

    roleExists(key: string): Promise<boolean> {
        return sendRoleExistsMessage(key);
    },

    async getRole(key: string): Promise<DRRole> {
        return sendGetRoleMessage(key);
    },

    async addRole(key: string, role: DRRole): Promise<DRRole> {
        return sendAddRoleMessage(key, role);
    },
    async createAndAddRole(key: string, name: string, sprites: DRSpriteList, flairs: DRFlairList): Promise<DRRole> {
        return sendAddRoleMessage(key, {
            name: name,
            sprites: sprites,
            flairs: flairs
        });
    },

    async removeRole(key: string): Promise<DRRole> {
        return sendRemoveRoleMessage(key);
    },
}