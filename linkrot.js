const BUST_SPRITE_FORMATTING = {
    minimumIntegerDigits: 2,
    useGrouping: false
};

const EARLY_WIKIA_SPRITES = Object.entries({
    kiyotaka: [2, 510, 533],
    byakuya: [2, 535, 552],
    mondo: [5, 3, 20],
    leon: [5, 22, 36],
    hifumi: [5, 38, 59],
    yasuhiro: [5, 61, 78],
    sayaka: [5, 80, 96],
    kyoko: [5, 98, 117],
    aoi: [5, 119, 142],
    toko: [5, 144, 172],
    sakura: [5, 174, 185],
    celeste: [5, 187, 203],
    mukuro_junko: [5, 205, 214],
    chihiro: [5, 216, 231],
    monokuma: [5, 233, 253],
    junko: [5, 255, 264]
})

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
    earlyWikiaSprites: matcher => {
        const cat = parseInt(matcher["cat"]) || 0;
        const sprite = parseInt(matcher["sprite"]) || 0;

        for (const [k, v] of EARLY_WIKIA_SPRITES) {
            if (cat === v[0] && sprite >= v[1] && sprite <= v[2]) return `${k}/${formatSprite(sprite - v[1])}`;
        }

        return `unknown_${cat}_${sprite}`;
    }
};