import path from 'path';
import WebExtPlugin from 'web-ext-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const CommonConfig = {
    entry: {
        service: "./src/service.ts",
        format: "./src/format.ts",
        test: "./src/test.ts"
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "assets", to: "../assets"}
            ],
        }),
    ],
};

const FirefoxConfig = {
    ...CommonConfig,
    name: 'firefox',
    output: {
        path: path.resolve(__dirname, "firefox/dist"),
        // filename: "[name].js",
        clean: true
    },
    plugins: [
        ...CommonConfig.plugins,
        new WebExtPlugin({
            sourceDir: path.resolve(__dirname, "firefox"),
            target: 'firefox-desktop'
        })
    ],
};

const ChromeConfig = {
    ...CommonConfig,
    name: 'chrome',
    output: {
        path: path.resolve(__dirname, "chrome/dist"),
        // filename: "[name].js",
        clean: true
    },
    plugins: [
        ...CommonConfig.plugins,
        new WebExtPlugin({
            sourceDir: path.resolve(__dirname, "chrome"),
            target: 'chromium'
        })
    ],
}

// noinspection JSUnusedGlobalSymbols
export default [FirefoxConfig, ChromeConfig];