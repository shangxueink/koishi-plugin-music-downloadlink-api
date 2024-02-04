"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.usage = exports.inject = exports.name = void 0;
const koishi_1 = require("koishi");
exports.name = 'music-downloadlink-api';
exports.inject = {
    required: ['http', 'puppeteer'],
};
exports.usage = `
[食用方法点此获取](https://www.npmjs.com/package/koishi-plugin-music-downloadlink-api)
`;
exports.Config = koishi_1.Schema.intersect([
    koishi_1.Schema.object({
        waitTimeout: koishi_1.Schema.natural().role('ms').description('允许用户返回选择序号的等待时间').default(45000),
        defaultQualityQQmusicDownload: koishi_1.Schema.number()
            .description('[qq-music-桑帛云]指令的默认下载音质【母带：14】【无损：11】【HQ：8】【标准：4】')
            .default(11),
    }).description('基础设置'),
    koishi_1.Schema.object({
        exitCommand: koishi_1.Schema.string().default('0, 不听了').description('退出选择指令，多个指令间请用逗号分隔开'), // 兼容中文逗号、英文逗号
        menuExitCommandTip: koishi_1.Schema.boolean().default(false).description('是否在歌单内容的后面，加上退出选择指令的文字提示'),
        retryExitCommandTip: koishi_1.Schema.boolean().default(true).description('是否交互序号错误时，加上退出选择指令的文字提示'),
    }).description('进阶设置'),
    koishi_1.Schema.object({
        imageMode: koishi_1.Schema.boolean().default(true).description('开启后返回图片歌单，关闭后返回文本歌单'),
        darkMode: koishi_1.Schema.boolean().default(true).description('是否开启暗黑模式')
    }).description('图片歌单设置'),
]);
async function search(http, platform, params) {
    let apiBase = 'https://api.xingzhige.com/API/QQmusicVIP';
    if (platform === 'NetEase Music')
        apiBase = 'https://api.xingzhige.com/API/NetEase_CloudMusic_new';
    return await http.get(apiBase, {
        params
    });
}
function formatSongList(data, platform, startIndex) {
    const formattedList = data.map((song, index) => `${index + startIndex + 1}. ${song.songname} -- ${song.name}`).join('<br />');
    return `<b>${platform}</b>:<br />${formattedList}`;
}
async function generateSongListImage(pptr, listText, cfg) {
    const textBrightness = cfg.darkMode ? 255 : 0;
    const backgroundBrightness = cfg.darkMode ? 0 : 255;
    const page = await pptr.browser.newPage();
    const textColor = `rgb(${textBrightness},${textBrightness},${textBrightness})`;
    const backgroundColor = `rgb(${backgroundBrightness},${backgroundBrightness},${backgroundBrightness})`;
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh">
      <head>
        <title>music</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            margin: 0;
            font-family: PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
            font-size: 16px;
            background: ${backgroundColor};
            color: ${textColor};
            min-height: 100vh;
          }
          #song-list {
            padding: 20px;
            display: inline-block; /* 使div适应内容宽度 */
            max-width: 100%; /* 防止内容溢出 */
            white-space: nowrap; /* 防止歌曲名称换行 */
            transform: scale(0.77);
          }
        </style>
      </head>
      <body>
        <div id="song-list">${listText}</div>
      </body>
    </html>
  `;
    await page.setContent(htmlContent);
    const clipRect = await page.evaluate(() => {
        const songList = document.getElementById('song-list');
        const rect = songList.getBoundingClientRect();
        return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    });
    const screenshot = await page.screenshot({
        clip: clipRect,
        encoding: 'binary'
    });
    await page.close();
    return screenshot;
}
// QQ音乐下载相关函数
async function fetchSongList(keyword) {
    const url = `https://api.lolimi.cn/API/yiny/?word=${encodeURIComponent(keyword)}&num=20`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch song list: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.code !== 200) {
        throw new Error(`API error: ${data.code}`);
    }
    return data.data;
}
async function fetchSongDetails(keyword, n, quality) {
    const url = `https://api.lolimi.cn/API/yiny/?word=${encodeURIComponent(keyword)}&num=20&n=${n}&q=${quality}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch song details: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.code !== 200) {
        throw new Error(`API error: ${data.code}`);
    }
    return data.data;
}
function formatSongList2(songs) {
    return songs.map((song, index) => `${index + 1}. ${song.song} -- ${song.singer}`).join('<br />');
}
function apply(ctx, cfg) {
    const logger = ctx.logger('music-downloadlink-api');
    const waitTimeInSeconds = cfg.waitTimeout / 1000;
    const exitCommands = cfg.exitCommand.split(/[,，]/).map(cmd => cmd.trim());
    const exitCommandTip = cfg.menuExitCommandTip ? `退出选择请发[${exitCommands}]中的任意内容<br /><br />` : '';
    // QQ音乐下载命令
    ctx.command('music-downloadlink-api/qq-music-桑帛云 [...keywords]')
        .option('quality', '-q <value:number>', { fallback: cfg.defaultQualityQQmusicDownload })
        .action(async ({ session, options, args }) => {
        const keyword = args.join(' ');
        if (!keyword) {
            await session.send('请输入歌曲名称。');
            return;
        }
        // 解析用户输入的音质参数，如果没有则使用默认配置
        const quality = options.quality ?? cfg.defaultQualityQQmusicDownload;
        // 获取歌曲列表
        const songs = await fetchSongList(keyword);
        if (!songs || songs.length === 0) {
            return '没有找到相关歌曲。';
        }
        const songListMessage = formatSongList2(songs);
        if (cfg.imageMode) {
            const imageBuffer = await generateSongListImage(ctx.puppeteer, songListMessage, cfg);
            await session.send(koishi_1.h.image(imageBuffer, 'image/png') + `${exitCommandTip}请在${waitTimeInSeconds}秒内，<br />输入歌曲对应的序号`);
        }
        else {
            await session.send(songListMessage + `<br /><br />${exitCommandTip}请在${waitTimeInSeconds}秒内，<br />输入歌曲对应的序号`);
        }
        // 用户回复序号
        const songChoice = await session.prompt(cfg.waitTimeout); // 获取用户的输入
        if (!songChoice)
            return '输入超时，已取消点歌。'; // 输入超时判断
        // 将 exitCommands 与 songChoice 比较，而不是 index
        if (exitCommands.includes(songChoice.trim())) {
            return '已退出歌曲选择。'; // 用户选择退出
        }
        const index = parseInt(songChoice, 10); // 将用户输入转换为数值
        // 有效性检查
        if (isNaN(index) || index < 1 || index > songs.length) {
            return '输入的序号无效。若要点歌请重新发起。';
        }
        // 获取用户选择的歌曲详细信息
        const details = await fetchSongDetails(keyword, index, quality);
        if (!details.url) {
            return '无法获取歌曲下载链接。';
        }
        // 发送用户选择的歌曲详细信息
        return [
            `歌曲：${details.song}`,
            `歌手：${details.singer}`,
            `品质：${details.quality}`,
            `大小：${details.size}`,
            `下载链接：${details.url}`,
            koishi_1.h.image(details.cover)
        ].join('\n');
    });
    ctx.command('music-downloadlink-api/qq-music-星之阁 [...keywords]')
        .action(async ({ session }, keyword) => {
        if (!keyword)
            return '请输入歌曲相关信息。';
        let qq;
        try {
            qq = await search(ctx.http, 'QQ Music', { name: keyword });
        }
        catch (e) {
            logger.warn('获取QQ音乐数据时发生错误', e);
        }
        let netease;
        try {
            netease = await search(ctx.http, 'NetEase Music', { name: keyword });
        }
        catch (e) {
            logger.warn('获取网易云音乐数据时发生错误', e);
        }
        const qqData = qq.data;
        const neteaseData = netease.data;
        const qqListText = qqData?.length ? formatSongList(qqData, 'QQ Music', 0) : '<b>QQ Music</b>: 无法获取歌曲列表';
        const neteaseListText = neteaseData?.length ? formatSongList(neteaseData, 'NetEase Music', qqData?.length ?? 0) : '<b>NetEase Music</b>: 无法获取歌曲列表';
        const songListText = `${qqListText}<br /><br />${neteaseListText}`;
        if (!qqData?.length && !neteaseData?.length)
            return '无法获取歌曲列表，请稍后再试。';
        if (cfg.imageMode) {
            const imageBuffer = await generateSongListImage(ctx.puppeteer, songListText, cfg);
            await session.send(koishi_1.h.image(imageBuffer, 'image/png') + `${exitCommandTip}请在${waitTimeInSeconds}秒内，<br />输入歌曲对应的序号`);
        }
        else {
            await session.send(songListText + `<br /><br />${exitCommandTip}请在${waitTimeInSeconds}秒内，<br />输入歌曲对应的序号`);
        }
        const input = await session.prompt(cfg.waitTimeout);
        if (!input)
            return '输入超时，已取消点歌。';
        if (exitCommands.includes(input)) {
            return '已退出歌曲选择。';
        }
        const num = +input;
        if (Number.isNaN(num) || num < 1 || num > (qqData?.length ?? 0) + (neteaseData?.length ?? 0)) {
            return '输入的序号错误，已退出歌曲选择。';
        }
        const songData = [];
        if (qqData) {
            songData.push(...qqData);
        }
        if (neteaseData) {
            songData.push(...neteaseData);
        }
        let platform, songid;
        const selected = songData[num - 1];
        if (selected.songurl.includes('163.com')) {
            platform = 'NetEase Music';
            songid = selected.id;
        }
        if (selected.songurl.includes('qq.com')) {
            platform = 'QQ Music';
            songid = selected.songid;
        }
        if (!platform)
            return '获取歌曲失败。';
        const song = await search(ctx.http, platform, { songid });
        if (song.code === 0) {
            const data = song.data;
            try {
                const songDetails = [
                    `歌曲：${data.songname}`,
                    `歌手：${data.name}`,
                    `音质：${data.quality}`,
                    `大小：${data.size}`,
                    `下载链接：${data.src}`,
                    koishi_1.h.image(data.cover)
                ].join('\n');
                return songDetails;
            }
            catch (e) {
                logger.error(e);
            }
        }
        else {
            return '获取歌曲失败。';
        }
    });
}
exports.apply = apply;
