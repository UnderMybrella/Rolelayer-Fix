const BUST_SPRITE_FORMATTING = {
    minimumIntegerDigits: 2,
    useGrouping: false
};

const EARLY_WIKIA_SPRITES = {

}

function formatSprite(num) {
    return (num || 0).toLocaleString("en-US", BUST_SPRITE_FORMATTING);
}

function formatSpriteOffset(matcher, offset) {
    return formatSprite(parseInt(matcher["sprite"]) - offset)
}

const LINKROT = {
    hiyokoSprites: matcher => formatSpriteOffset(matcher, 1),
    mikanSprites: matcher => formatSpriteOffset(matcher, 2),
    leonSprites: matcher => formatSpriteOffset(matcher, 22),
    kyokoSprites: matcher => formatSpriteOffset(matcher, 98),
};