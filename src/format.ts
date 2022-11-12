import {ClassName} from "./classnames";

const SYSTEM_MESSAGE_REGEXP = RegExp("(?:added|updated|deleted|removed) (?:to|in|from) (?:your|the) truth bullets?", "i");

function formatDocument() {
    if (filterOutPosts()) return;

    ClassName.RL_ACTIVE.addTo(document.body);

    // Transform the H2 nodes in P nodes, in thread comments.
    document
        .querySelectorAll(".thing.comment h2")
        .forEach(h2 => {
            const paragraph = document.createElement("p");

            for (let kid = h2.firstChild; kid; kid = kid.nextSibling)
                paragraph.appendChild(kid);

            h2.parentNode.replaceChild(paragraph, h2);
        });

    // Format system messages
    document
        .querySelectorAll(".thing.comment .usertext-body blockquote")
        .forEach((blockquote) => {
            if (ClassName.COMMENT_SYS_MESSAGE.containedIn(blockquote)) return;

            if (SYSTEM_MESSAGE_REGEXP.test(blockquote.textContent)) {
                ClassName.DIALOGUE.addTo(blockquote.parentElement);
                ClassName.COMMENT_SYS_MESSAGE.addTo(blockquote);
            }
        });

    // Insert sprites for comments loaded dynamically
    document
        .querySelectorAll(".morecomments a.button")
        .forEach((button) => {
            if (ClassName.SCANNED.containedIn(button)) return;

            ClassName.SCANNED.addTo(button);
            ClassName.BUTTON_FORMAT_LISTENING.addTo(button)

            button.addEventListener("click", () => setTimeout(formatDocument, 3000), true);
        })

    document
        .querySelectorAll(".thing.self, .thing.comment")
        .forEach((thing) => {
            if (ClassName.SCANNED.containedIn(thing)) return;

            ClassName.SCANNED.addTo(thing);

            formatSprites(thing);
            if (thing instanceof HTMLElement) {
                requestAnimationFrame(() => highlightNewComments(thing));
            }
        })
}

function highlightNewComments(thing: HTMLElement) {
    const time =
        thing.querySelector(".edited-timestamp") ||
        thing.querySelector(".live-timestamp");

    if (time) {
        const dataset = <RedditThingDataset>thing.dataset;
        const lastUpdate = parseInt(sessionStorage.getItem(dataset.fullname));
        const current = new Date(time.getAttribute("datetime")).getTime();

        if (isNaN(lastUpdate) || current > lastUpdate) {
            ClassName.NEW_COMMENT.addTo(thing)
            sessionStorage.setItem(dataset.fullname, current.toString());
        }
    }
}

function formatSprites(thing: Element) {
    const comment = thing.querySelector(".entry .md");
    if (!comment) return;

    // The actual formatter
    comment.querySelectorAll("p")
        .forEach((paragraph) => {
            paragraph.querySelectorAll("a")
                .forEach((anchor) => {
                    const uri = anchor.href?.trim();

                    if (!uri) return;

                    // if (uri_showdown.test(uri)) {
                    //     ClassName.COMMENT_SHOWDOWN.addTo(thing.querySelector(".entry"));
                    //     return;
                    // }
                    //
                    // if (uri_ignored.test(uri)) return;

                    normaliseImageSource(anchor.href)
                        .then(loadImage)
                        .then(image => anchor.hash == "#evidence"
                            ? onEvidenceLoaded(image, anchor, paragraph)
                            : onSpriteLoaded(image, anchor, paragraph));
                });
        });
}

function filterOutPosts(): boolean {
    return RegExp("/r/danganronpa/", "i").test(location.href) &&
        !RegExp("class trial", "i").test(document.title);
}

async function normaliseImageSource(uri) {
    let url = new URL(uri);

    // if (uri_appspot.test(uri)) {
    //
    // }

    // if (uri_https.test(uri)) {
    //     url.protocol = "https:"
    //     uri = url.toString()
    // }

    // Normalize Wikia images
    if (uri.indexOf(".wikia.") > -1) {
        uri = uri.replace(/revision\/latest.+$/, "").replace(/\/$/, "");
    }

    return uri;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return fetch(src, {method: "HEAD"})
        .then(response => response.status === 200
                ? makeImage(response.url, () => loadImageSet(src))
                : loadImageSet(src),
            () => loadImageSet(src));
}

async function loadImageSet(src: string): Promise<HTMLImageElement> {
    src = decodeURIComponent(src);

    // for (const [key, value] of Object.entries(await DRreddit.linkrot())) {
    //     if (src.match(key)) return loadImageFromSet(src, value, 0)
    // }

    //No valid link to replace, default handling
    return makeImage(src);
}

function loadImageFromSet(src: string, set: string[], i: number): Promise<HTMLImageElement> {
    if (i > set.length) {
        return makeImage(src);
    }

    return fetch(set[i], {method: "HEAD"})
        .then(response => response.status === 200
                ? makeImage(response.url, () => loadImageFromSet(src, set, i + 1))
                : loadImageFromSet(src, set, i + 1),
            () => loadImageFromSet(src, set, i + 1));
}

function onSpriteLoaded(img: HTMLImageElement, a: HTMLAnchorElement, p: HTMLParagraphElement) {
    ClassName.DIALOGUE.addTo(p.parentElement);
    ClassName.STATEMENT.addTo(p);

    const hr = document.createElement("hr");
    ClassName.STATEMENT_SPLIT.addTo(hr);
    a.parentElement.insertBefore(hr, a);

    ClassName.SPRITE_ROOT.addTo(img);
    if (img.naturalWidth / img.naturalWidth > 0.75)
        ClassName.SPRITE_VERTICAL.addTo(img);

    a.parentNode.insertBefore(img, a);

    img.onload = null;
    img.onerror = null;
}

function onEvidenceLoaded(img: HTMLImageElement, a: HTMLAnchorElement, p: HTMLParagraphElement) {
    ClassName.DIALOGUE.addTo(p.parentElement);
    ClassName.EVIDENCE.addTo(img);

    p.parentElement.insertBefore(img, p.nextSibling)

    img.onload = null;
    img.onerror = null;
}

function makeImage(src: string, onerror?: OnErrorEventHandler): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = onerror ? onerror : reject;
        image.src = src;
    });
}

document.addEventListener("DOMContentLoaded", formatDocument, true);