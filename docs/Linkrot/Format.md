The linkrot format is pretty basic, but allows for some complex rerouting.

First of all, linkrot only kicks in when the image fails to load; we do a HEAD request first, and if we get anything other than a 200 SUCCESS we immediately go to linkrot handling. 

`linkrot.json` is loaded by the service worker, and is responsible for parsing it. The keys are parsed as regex, and the values can be one of three things:
- If the value is a string, it's parsed as a replacement url
- If the value is an array, it's parsed as a set of replacement urls
- If the value is an object, it's handled as a sub-handler, and handling continues.

Keys are parsed as generic JS Regex, with a few special handlers:
- `{{wikia}}` is replaced with `(static|vignette\\d).wikia(.nocookie.net|.com)`
- `{{tumblr}}` is replaced with `\\d{2}.media.tumblr.com`
- `<< (.+) >>` is a shorthand for escaping string literals

Values are parsed as basic strings, with a few special handlers:
- `{{HOST}}` is replaced with `https://abimon.org/dr/busts`
- `{{HOST_UDG}}` is replaced with `https://abimon.org/dr/udg/resized`
- `{{%name%}}` is dynamically replaced with the named capture group `name`./.