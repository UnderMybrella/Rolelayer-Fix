const uri_appspot = RegExp("r-drrp\\.appspot\\.com");

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
});

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

function normalizeImageSource(uri) {
    let url = new URL(uri);

    // Check if the URL matches the r-drrp.appspot.com pattern
    if (uri_appspot.test(uri)) {
        let character = url.pathname.split('/')[2];  // get the character name
        let number = url.pathname.split('_')[1].split('.')[0];  // get the number

        // Form the new URL
        uri = `https://ik.imagekit.io/drrp/sprites/${character}/${number}.png`;
        return Promise.resolve(uri);
    }

    if (url.protocol === "http:" && location.protocol === "https:") {
        url.protocol = "https:";
        uri = url.toString();
    }

    // Normalize Wikia images
    if (uri.indexOf(".wikia.") > -1) {
        uri = uri.replace(/revision\/latest.+$/, "").replace(/\/$/, "");
    }

    return Promise.resolve(uri);
}

function loadImage(src) {
    console.log(`Loading ${src}`)
    return fetchImage(src, () => loadImageSet(src))
        .then(img => {
            console.log(`Finally loaded ${src} to ${img}`)
            return img
        }, e => {
            console.log(`Failed to load ${src}`)
            console.log(e)
            throw e
        });
}

function loadImageSet(src) {
    src = decodeURIComponent(src);

    console.log(`Loading Image Set of ${src}`)

    return new Promise(function (resolve) {
        chrome.runtime.sendMessage({type: "LINKROT", url: src}, resolve)
    }).then(set => Array.isArray(set) ? loadImageFromSet(src, set, 0) : makeImagePromise(src), () => makeImagePromise(src));
}

function loadImageFromSet(src, set, i) {
    if (i > set[0].length) {
        return makeImagePromise(src);
    }

    let url = normaliseLinkrotSrc(set[0][i], set[1]);

    console.log(`Loading image from set for ${src} => ${url}`)

    return fetchImage(url, () => loadImageFromSet(src, set, i + 1));
}

//(?:#(?<formatting>.+?))?
const LINKROT_REGEX = new RegExp(/{{%(?<key>\w+)%}}/g);
const LINKROT_FORMATTER = new RegExp(/(?<key>\w+)\[(?<value>.+?)\]/g);

function normaliseLinkrotSrc(src, matches) {
    if (typeof src !== "string") src += "";
    if (!src.includes("{{%")) return src;

    console.log(`NORMALISING ${src}`)
    console.log(matches)
    let matcher = {};

    for (const match of matches) {
        if (match) {
            for (const [k, v] of Object.entries(match)) {
                matcher[k] = v;
            }
        }
    }

    return normaliseLinkrotFromMatcher(src, matcher);
}

function normaliseLinkrotFromMatcher(src, matcher) {
    return src.replace(LINKROT_REGEX, (match, key) => {
        if (key.startsWith("_")) {
            key = key.substring(1);
            console.log(`RUNNING LINKROT[${key}]`)
            const func = LINKROT[key];
            console.log("LINKROT: ");
            console.log(LINKROT);
            console.log(func);
            if (typeof func === "undefined") return match;

            return func(matcher);
        }

        let value = matcher[key];
        if (typeof value === "undefined") return match;

        return value;
    })
}

function makeImage(src, onLoad, onError) {
    console.log(`Making image for ${src}`);

    const image = new Image();
    image.onload = () => onLoad(image);
    image.onerror = onError;
    image.src = src;
}

function makeImagePromise(src, onError) {
    console.log(`Making image promise for ${src}`);
    return new Promise((resolve, reject) => makeImage(src, resolve, onError === undefined ? reject : () => onError().then(resolve, reject)))
}

function fetchImage(src, onError) {
    console.log(`Fetching ${src}`)
    return fetch(src, {method: "HEAD"})
        .then(response => response.status === 200 ? makeImagePromise(response.url, onError) : onError(), () => makeImagePromise(src, onError));
}

exports.loadImageFromSet = loadImageFromSet;
exports.normaliseLinkrotSrc = normaliseLinkrotSrc;