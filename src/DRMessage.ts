export const OpenSettings: { type: "SETTINGS_OPEN" } = {
    type: "SETTINGS_OPEN"
}

export class RetrieveProfile {
    type: "PROFILE_RETRIEVE";

    readonly character: string;

    constructor(character: string) {
        this.character = character;
    }
}

export class ResolveSprites {
    type: "SPRITES_RESOLVE";
}

export class GetListSprites {
    type: "SPRITES_GETLIST";
}

export type DRMessage = typeof OpenSettings | RetrieveProfile | ResolveSprites | GetListSprites;