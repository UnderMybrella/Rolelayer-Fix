const assert = require('assert');
const fs = require('fs');
const {loadImageFromSet, normaliseLinkrotSrc} = require('../linkrot');
const http = require('http');

const SPRITE_HOST = "https://abimon.org/dr/busts";
const SPRITE_HOST_UDG = `${SPRITE_HOST}/udg/resized`
const SPRITE_HOST_V3 = `${SPRITE_HOST}/spoilers/v3`

const LINKROT_TABLE = normaliseLinkrot(JSON.parse(fs.readFileSync("linkrot.json")));
let LINKROT_CACHE = {};

const BUST_SPRITE_FORMATTING = {
    minimumIntegerDigits: 2,
    useGrouping: false
};

function normaliseLinkrot(json) {
    console.log(`Base Linkrot: `, json);

    let linkrot = {}
    for (const [key, value] of Object.entries(json)) {
        if (key.startsWith("#")) continue;

        if (Array.isArray(value)) {
            linkrot[normaliseLinkrotKey(key)] = value.map(normaliseLinkrotValue);
        } else if (typeof value === "string") {
            linkrot[normaliseLinkrotKey(key)] = [normaliseLinkrotValue(value)];
        } else {
            linkrot[normaliseLinkrotKey(key)] = normaliseLinkrot(value);
            // for (const [innerKey, innerValue] of Object.entries(normaliseLinkrot(value))) {
            // 	linkrot[normaliseLinkrotKey(key) + innerKey] = innerValue;
            // }
        }
    }

    console.log(`Linkrot: `, linkrot);

    return linkrot;
}

function normaliseLinkrotKey(key) {
    return key.replace("{{wikia}}", "(static|vignette\\d).wikia(.nocookie.net|.com)")
        .replace("{{tumblr}}", "\\d{2}.media.tumblr.com")
        .replace(/<< (.+) >>/, quoted => escapeRegex(quoted.substring(3, quoted.length - 3)))
}

function normaliseLinkrotValue(value) {
    return (value + "").replace("{{HOST}}", SPRITE_HOST)
        .replace("{{HOST_UDG}}", SPRITE_HOST_UDG);
}

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function resolveLinkrot(url, linkrot = LINKROT_TABLE, matches) {
    console.log(`Resolving ${url}`);

    for (const [key, value] of Object.entries(linkrot)) {
        let regex = LINKROT_CACHE[key];
        if (regex === undefined) {
            regex = new RegExp(key);
            LINKROT_CACHE[key] = regex;
        }

        let match = url.match(regex);

        if (match !== null) {
            console.log(`Matched ${key} to ${value}`)
            if (Array.isArray(matches)) matches.push(match.groups);
            else matches = [match.groups];

            if (Array.isArray(value)) return [value, matches];
            else return resolveLinkrot(url, value, matches);
        }
    }

    throw new Error("No url matched");
}

function loadImageSet(src) {
    src = decodeURIComponent(src);

    console.log(`Loading Image Set of ${src}`)

    const [set, matches] = resolveLinkrot(src);
    return set.map(str => normaliseLinkrotSrc(str, matches));
}

/**
 * @param {string} src
 * @param {string} character
 * @param {number} sprite
 */
function bustSpriteEqual(src, character, sprite) {
    assert.equal(src, `${SPRITE_HOST}/${character}/${sprite.toLocaleString("en-US", BUST_SPRITE_FORMATTING)}`)
}

describe('Linkrot', function() {
    describe('Wikia', function() {
        it("Early Wikia Sprites", async function() {
            /** @type {string[][]} */
            const earlyWikiaSprites = JSON.parse(fs.readFileSync("test/early_wikia_dr1.json")).map(loadImageSet);
            fs.writeFileSync("test/early_wikia_dr1_resolved.json", JSON.stringify(earlyWikiaSprites));
        })
    })
})