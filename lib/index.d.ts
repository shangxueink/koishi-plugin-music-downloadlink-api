import { Context, Schema } from 'koishi';
export declare const name = "music-downloadlink-api";
export declare const inject: {
    required: string[];
};
export declare const usage = "\n[\u98DF\u7528\u65B9\u6CD5\u70B9\u6B64\u83B7\u53D6](https://www.npmjs.com/package/koishi-plugin-music-downloadlink-api)\n";
export interface Config {
    waitTimeout: number;
    exitCommand: string;
    menuExitCommandTip: boolean;
    retryExitCommandTip: boolean;
    defaultQualityQQmusicDownload: number;
    imageMode: boolean;
    darkMode: boolean;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, cfg: Config): void;
