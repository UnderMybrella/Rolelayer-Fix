import path from 'path';
import WebExtPlugin from 'web-ext-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// noinspection JSUnusedGlobalSymbols
export default {
    entry: {
        background: "./src/background.ts",
        format: "./src/format.ts",
        test: "./src/test.ts"
    },
    output: {
        path: path.resolve(__dirname, "addon/dist"),
        // filename: "[name].js",
        clean: true
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [new WebExtPlugin({ sourceDir: path.resolve(__dirname, "addon") })],
};