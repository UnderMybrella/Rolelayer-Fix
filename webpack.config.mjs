import path from 'path';
import WebExtPlugin from 'web-ext-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


export default {
    entry: {
        background_scripts: "./background_scripts/background.js",
        popup: "./popup/left-pad.js"
    },
    output: {
        path: path.resolve(__dirname, "addon"),
        filename: "[name]/index.js"
    },
    mode: 'none',

    plugins: [new WebExtPlugin({ sourceDir: path.resolve(__dirname, "addon") })],
};