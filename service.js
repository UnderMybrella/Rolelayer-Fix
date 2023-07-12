const SPRITE_HOST = "https://abimon.org/dr/busts";
const SPRITE_HOST_UDG = `${SPRITE_HOST}/udg/resized`
const SPRITE_HOST_V3 = `${SPRITE_HOST}/spoilers/v3`


function normalizeCharacterName(name) {
    name = name.toLowerCase();
    name = name.split("-")[0];

    if (name in character_map) name = character_map[name];

    return Promise.resolve(name);
}

const character_map = {
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
};
const LINKROT_TABLE = fetch("linkrot.json")
    .then(response => response.json())
    .then(json => normaliseLinkrot(json));
let LINKROT_CACHE = {};

// LISTENER

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    switch (request.type) {
        case "SETTINGS_OPEN":
            if ("runtime" in chrome && "openOptionsPage" in chrome.runtime)
                chrome.runtime.openOptionsPage();
            else chrome.tabs.create({url: chrome.extension.getURL("options.html")});

            return false;

        case "PROFILE_RETRIEVE":
            getCharacterProfile(request.character).then(sendResponse);
            return true;

        case "SPRITES_RESOLVE":
            resolveSpriteUrl(request.uri).then(sendResponse);
            return true;

        case "SPRITES_GETLIST":
            if (Array.isArray(request.custom_sprites)) {
                Promise.resolve(request.custom_sprites)
                    .then(sendSpritesBack)
                    .then(sendResponse);
            } else {
                normalizeCharacterName(request.character)
                    .then(async name => {
                        let request = await fetch("busts.json");
                        const busts = await request.json();

                        if (name in busts) return busts[name];

                        const profile = await getCharacterProfile(name);
                        return profile.sprites;
                    })
                    .then(sendSpritesBack)
                    .then(sendResponse);
            }

            return true;

        case "LINKROT":
            LINKROT_TABLE
                .then(linkrot => resolveLinkrot(request.url, linkrot))
                .then(sendResponse);

            return true;

        default:
            return false;
    }

    /*
        async function sendSpritesBack(list) {
            const promises = list.map(async sprite => {
              if (typeof sprite === 'string') {
                const src = await resolveSpriteUrl(sprite);
                return src ? { permalink: sprite, real: src } : null;
              } else if (typeof sprite === 'object' && sprite.src && typeof sprite.src === 'string') {
                const src = await resolveSpriteUrl(sprite.src);
                return src ? { permalink: sprite.src, real: src } : null;
              } else {
                return null;
              }
            });

            const sprites = await Promise.all(promises);
            return sprites.filter(Boolean);
          }
    */
    async function sendSpritesBack(list) {
        const promises = list.map(async sprite => {
            if (typeof sprite === 'string') {
                const src = await resolveSpriteUrl(sprite);
                return src ? {permalink: sprite, real: src, isOriginal: true} : null;
            } else if (typeof sprite === 'object' && sprite.src && typeof sprite.src === 'string') {
                const src = await resolveSpriteUrl(sprite.src);
                //return src ? { permalink: sprite.src, real: src, isOriginal: sprite['is-original'] || false } : null;
                return src ? {permalink: sprite.src, real: src, isOriginal: false} : null;
            } else {
                return null;
            }
        });

        const sprites = await Promise.all(promises);
        return sprites.filter(Boolean);
    }


    /*
    function resolveSpriteUrl(uri) {
        //const url = typeof uri === 'string' ? new URL(uri) : new URL(uri.src);
        const url = typeof uri === 'object' && uri.src ? new URL(uri.src) : new URL(uri);
        const key = url.pathname.replace("characters/", "");

        return localStorageGet(key)
          .catch(function(err) {
            return fetch(uri, {
              mode: "cors"
            }).then(function(response) {
              chrome.storage.local.set({ key: response.url });
              return response.url;
            });
          })
          .then(uri => uri + url.hash, err => null);
      }*/

    function resolveSpriteUrl(uri) {
        let url;
        if (typeof uri === 'string') {
            url = new URL(uri);
        } else if (typeof uri === 'object' && uri.src && typeof uri.src === 'string') {
            url = new URL(uri.src);
        } else {
            return Promise.resolve(null);
        }

        const key = url.pathname.replace("characters/", "");

        return localStorageGet(key)
            .catch(function (err) {
                return fetch(uri, {
                    mode: "cors"
                }).then(function (response) {
                    chrome.storage.local.set({key: response.url});
                    return response.url;
                });
            })
            .then(uri => uri + url.hash, err => null);
    }


    return true;
});

async function getCharacterProfile(character) {
    character = await normalizeCharacterName(character);
    const key = `profile_${character}`;
    console.debug('key');

    const cache = await SettingStorage.get(key);
    if (cache && key in cache) return cache[key];

    const request = await fetch(
        `https://frbrz-kumo.appspot.com/postit/busts.json`
    );
    const profile = await request.json();

    await SettingStorage.set({['key']: profile});

    return profile;
};

function localStorageGet(key) {
    const value = chrome.storage.local.get(['key']);

    return value !== null
        ? Promise.resolve(value)
        : Promise.reject("Key doesn't exist in localStorage: " + key);
};

function localStorageSet(item) {
    //chrome.storage.local.set({key: item.key, value: item.value});
    chrome.storage.local.set({item: item.value});
    return item.value;
};


function install() {
    const getOption = (first, defecto) => (first != null ? first : defecto);

    SettingStorage.get()
        .then(function (settings) {
            return {
                theme: getOption(settings.theme, "default"),
                bullets_bgred: getOption(settings.bullets_bgred, false),
                banner_paused: getOption(settings.banner_paused, true),
                sprites_sourcelist: getOption(
                    settings.sprites_sourcelist,
                    "https://frbrz-kumo.appspot.com/postit/busts.json"
                )
            };
        })
        .then(SettingStorage.set);
}

// UTILS

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
    return value.replace("{{HOST}}", SPRITE_HOST)
        .replace("{{HOST_UDG}}", SPRITE_HOST_UDG);
}

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function resolveLinkrot(url, linkrot, matches) {
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

            if (Array.isArray(value)) return Promise.resolve([value, matches]);
            else return resolveLinkrot(url, value, matches);
        }
    }

    return Promise.reject("No url matched");
}

