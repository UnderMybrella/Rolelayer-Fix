const browser = require("webextension-polyfill");

import {DRRole} from "./RoleLayer";

export enum DRMessageType {
    SETTINGS_OPEN,
    RETRIEVE_PROFILE,
    RESOLVE_SPRITES,
    GET_LIST_SPRITES,

    ROLE_EXISTS,
    GET_ROLE,
    ADD_ROLE,
    REMOVE_ROLE,
}

export const OpenSettingsMessage: { type: DRMessageType.SETTINGS_OPEN } = {
    type: DRMessageType.SETTINGS_OPEN
}

export class RetrieveProfileMessage {
    readonly type = DRMessageType.RETRIEVE_PROFILE;

    readonly character: string;

    constructor(character: string) {
        this.character = character;
    }
}

export class ResolveSpritesMessage {
    readonly type = DRMessageType.RESOLVE_SPRITES;
}

export class GetListSpritesMessage {
    readonly type = DRMessageType.GET_LIST_SPRITES;
}

export class RoleExistsMessage {
    readonly type = DRMessageType.ROLE_EXISTS;

    readonly key: string;

    constructor(key: string) {
        this.key = key;
    }
}

export class GetRoleMessage {
    readonly type = DRMessageType.GET_ROLE;

    readonly key: string

    constructor(key: string) {
        this.key = key;
    }
}

export class AddRoleMessage {
    readonly type = DRMessageType.ADD_ROLE;

    readonly key: string;
    readonly role: DRRole;

    constructor(key: string, role: DRRole) {
        this.key = key;
        this.role = role;
    }
}

export class RemoveRoleMessage {
    readonly type = DRMessageType.REMOVE_ROLE;

    readonly key: string;

    constructor(key: string) {
        this.key = key;
    }
}

export type DRMessage =
    typeof OpenSettingsMessage
    | RetrieveProfileMessage
    | ResolveSpritesMessage
    | GetListSpritesMessage
    | RoleExistsMessage
    | GetRoleMessage
    | AddRoleMessage
    | RemoveRoleMessage
    ;

export function sendOpenSettingsMessage(): Promise<void> {
    return browser.runtime.sendMessage(OpenSettingsMessage);
}

export function sendRetrieveProfileMessage(character: string): Promise<void> {
    return browser.runtime.sendMessage(new RetrieveProfileMessage(character));
}

export function sendResolveSpritesMessage(): Promise<void> {
    return browser.runtime.sendMessage(new ResolveSpritesMessage());
}

export function sendGetListSpritesMessage(): Promise<void> {
    return browser.runtime.sendMessage(new GetListSpritesMessage());
}

export function sendRoleExistsMessage(key: string): Promise<boolean> {
    return browser.runtime.sendMessage(new RoleExistsMessage(key));
}

export function sendGetRoleMessage(key: string): Promise<DRRole> {
    return browser.runtime.sendMessage(new GetRoleMessage(key));
}

export function sendAddRoleMessage(key: string, role: DRRole): Promise<DRRole> {
    return browser.runtime.sendMessage(new AddRoleMessage(key, role))
}

export function sendRemoveRoleMessage(key: string): Promise<DRRole> {
    return browser.runtime.sendMessage(new RemoveRoleMessage(key));
}