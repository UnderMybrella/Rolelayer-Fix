"use strict";

document.addEventListener("DOMContentLoaded", executeFormat, true);

var uri_appspot = RegExp("r-drrp\\.appspot\\.com"),
    uri_showdown = RegExp("mymjF4AZJrg|#rebuttal"),
    uri_continue = RegExp("reddit.com/r/w+/comments/[a-z0-9]+/w+/[a-z0-9]+"),
    uri_ignored = RegExp(
        [
            "#ignore",
            ".json",
            "youtu.?be",
            // I'm not sure why we're ignoring discord links??
            // "discord",
            "redd.it/",
            "reddit.com/",
            "localhost"
        ].join("|")
    );

function executeFormat() {
    if (
        RegExp("/r/danganronpa/", "i").test(location.href) &&
        !RegExp("class trial", "i").test(document.title)
    )
        return;

    document.body.classList.add(CLASSNAMES.RLACTIVE);

    // Transform the H2 nodes in P nodes, in thread comments.
    document.querySelectorAll(".thing.comment h2").forEach(function (h2) {
        let paragraph = document.createElement("p");

        for (let kid = h2.firstChild; kid; kid = kid.nextSibling)
            paragraph.appendChild(kid);

        h2.parentNode.replaceChild(paragraph, h2);
    });

    // Format system messages
    document
        .querySelectorAll(".thing.comment .usertext-body blockquote")
        .forEach(function (blockquote) {
            if (blockquote.classList.contains(CLASSNAMES.COMMENT_SYSMESSAGE)) return;

            let sysmsg = RegExp(
                "(?:added|updated|deleted|removed) (?:to|in|from) (?:your|the) truth bullets?",
                "i"
            );

            if (sysmsg.test(blockquote.textContent)) {
                blockquote.parentNode.classList.add(CLASSNAMES.DIALOGUE);
                blockquote.classList.add(CLASSNAMES.COMMENT_SYSMESSAGE);
            }
        });

    // Insert sprites for comments loaded dynamically
    document.querySelectorAll(".morecomments a.button").forEach(function (button) {
        if (button.classList.contains(CLASSNAMES.SCANNED)) return;

        button.classList.add(CLASSNAMES.SCANNED);
        button.classList.add(CLASSNAMES.BUTTON_FORMATLISTENING);
        button.addEventListener(
            "click",
            function () {
                // I know. But there's no other way.
                setTimeout(executeFormat, 3000);
            },
            true
        );
    });

    document
        .querySelectorAll(".thing.self, .thing.comment")
        .forEach(function (thing) {
            if (thing.classList.contains(CLASSNAMES.SCANNED)) return;
            thing.classList.add(CLASSNAMES.SCANNED);

            loadSprites(thing);
            requestAnimationFrame(function () {
                highlightNewComments(thing);
            });
        });
}

function highlightNewComments(thing) {
    let time =
        thing.querySelector(".edited-timestamp") ||
        thing.querySelector(".live-timestamp");

    if (time) {
        let last_update = sessionStorage.getItem(thing.dataset.fullname);
        let current = new Date(time.getAttribute("datetime")).getTime();

        if (current > last_update) {
            thing.classList.add("new-comment");
            sessionStorage.setItem(thing.dataset.fullname, current);
        }
    }

    thing = null;
}

function loadSprites(thing) {
    let comment = thing.querySelector(".entry .md");
    if (!comment) return;

    // The actual formatter
    let paragraphs = comment.querySelectorAll("p");

    for (let paragraph of paragraphs) {
        let anchors = paragraph.querySelectorAll("a");

        for (let anchor of anchors) {
            let uri = anchor.href.trim();

            if (!uri) continue;

            // REBUTTAL SHOWDOWN!
            if (uri_showdown.test(uri)) {
                thing
                    .querySelector(".entry")
                    .classList.add(CLASSNAMES.COMMENT_SHOWDOWN);
                continue;
            }

            // IGNORED URL PATTERNS
            if (uri_ignored.test(uri)) continue;
            if (uri.includes("discord") && !(uri.includes("cdn") || uri.includes("media") || uri.includes("images"))) continue;

            // if (uri_continue.test(uri)) {
            // 	paragraph.classList.add(CLASSNAMES.COMMENT_COMESFROM);
            // 	continue;
            // }

            normalizeImageSource(anchor.href)
                .then(loadImage)
                .then(function (image) {
                    return anchor.hash == "#evidence"
                        ? loadEvidenceImage.call(image, anchor, paragraph)
                        : loadSpriteImage.call(image, anchor, paragraph);
                });
        }
    }
}

function callBackground(message) {
    return new Promise(function (resolve) {
        chrome.runtime.sendMessage(message, resolve);
    });
}

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
    return src.replace(LINKROT_REGEX, (match, key, formatting) => {
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

        // for (let array of formatting.matchAll(LINKROT_FORMATTER)) {
        //     const formatKey = array.groups.key;
        //     const formatValue = array.groups.value;
        //
        //     console.log(`Formatting ${formatKey} w/ ${formatValue} => ${value}`);
        //
        //     switch (formatKey) {
        //         case "add":
        //             if (typeof value === "number") value = value + (parseFloat(formatValue) || 0);
        //             else value = (parseFloat(value) || 0) + (parseFloat(formatValue) || 0);
        //             break;
        //         case "sub":
        //             if (typeof value === "number") value = value - (parseFloat(formatValue) || 0);
        //             else value = (parseFloat(value) || 0) - (parseFloat(formatValue) || 0);
        //             break;
        //         case "digits":
        //             if (typeof value === "number") value = value.toLocaleString("en-US", {
        //                 minimumIntegerDigits: parseInt(formatValue) || 2,
        //                 useGrouping: false
        //             });
        //             break;
        //         default:
        //             console.error(`Unknown linkrot format operation ${formatKey}[${formatValue}]`)
        //             break;
        //     }
        //
        //     console.log(`Formatting ${formatKey} w/ ${formatValue} => ${value}`);
        // }

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

function loadSpriteImage(a, p) {
    p.parentNode.classList.add(CLASSNAMES.DIALOGUE);

    p.classList.add(CLASSNAMES.STATEMENT);

    let hr = document.createElement("hr");
    hr.classList.add(CLASSNAMES.STMNTSPLIT);
    a.parentNode.insertBefore(hr, a);

    this.classList.add(CLASSNAMES.SPRITE_ROOT);
    if (this.naturalHeight / this.naturalWidth > 0.75)
        this.classList.add(CLASSNAMES.SPRITE_VERTICAL);
    a.parentNode.insertBefore(this, a);

    this.onload = null;
    this.onerror = null;
}

function loadEvidenceImage(a, p) {
    p.parentNode.classList.add(CLASSNAMES.DIALOGUE);

    this.classList.add(CLASSNAMES.EVIDENCE);
    p.parentNode.insertBefore(this, p.nextSibling);

    this.onload = null;
    this.onerror = null;
}
