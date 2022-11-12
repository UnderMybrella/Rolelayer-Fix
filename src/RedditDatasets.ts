interface RedditThingDataset extends DOMStringMap {
    author: string,
    authorFullname: string,
    fullname: string,
    gildings: string,
    subreddit: string,
    subredditFullname: string,
    subredditPrefixed: string,
}

interface RedditCommentDataset extends RedditThingDataset {
    permalink: string,
    replies: string,
}

interface RedditPostDataset extends RedditThingDataset {
    commentsCount: string,
    context: string,
    domain: string,
    isGallery: string,
    nsfw: string,
    numCrossposts: string,
    oc: string,
    permalink: string,
    promoted: string,
    rank: string,
    score: string,
    spoiler: string,
    subredditType: string,
    timestamp: string,
    type: string,
    url: string,
    whitelistStatus: string
}