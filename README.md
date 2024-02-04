# koishi-plugin-music-downloadlink-api

[![npm](https://img.shields.io/npm/v/koishi-plugin-music-downloadlink-api?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-music-downloadlink-api)

🎵 **音乐下载** - 搜索并提供QQ音乐和网易云音乐平台的歌曲下载链接，🤩付费的也可以欸！？

## 特点

- **搜索歌曲**：🤩 支持QQ音乐和网易云音乐平台的歌曲搜索。
- **下载歌曲**：🎶 QQ平台支持以不同音质下载歌曲，满足不同的音乐体验需求。提供免费以及付费音乐的下载链接。
- **歌曲详情**：🎧 获取包括音质、大小和下载链接在内的歌曲详细信息。
- **友好交互**：📱 简单易用的指令，快速获取你喜欢的音乐。

## 安装

在koishi插件市场搜索并安装`music-downloadlink-api`

## 使用

在你的聊天环境中，你可以使用以下指令 来搜索和下载音乐，支持QQ和网易云平台

### 使用`music-downloadlink-星之阁`搜索并下载歌曲

交互示例：

**用户**：

```code
music-downloadlink-星之阁 <歌曲名称>
```

**机器人**：

```code
这里是一个歌曲列表
```

**用户**：

```code
[选择的歌曲序号]
```

**机器人**：

```code
对应歌曲的下载链接
```

### 使用`qq-music-夏柔`或者`qq-music-桑帛云`搜索并下载QQ歌曲

其中，`qq-music-桑帛云`指令 允许用户使用 `-q` 选项指定选择歌曲的下载品质。
并且品质数应该是一个 4到14 的正整数。

`qq-music-夏柔`暂不支持自选音质。

交互示例：
**用户**：

```code
qq-music-桑帛云  -q 11  <歌曲名称>  
```

**机器人**：

```code
这里是一个歌曲列表
```

**用户**：

```code
[选择的歌曲序号]
```

**机器人**：

```code
对应歌曲的下载链接，并且品质是指定的11
```

### 对于`qq-music-桑帛云`指令的默认配置

我们在控制台部署了一个默认音乐品质的参数，默认为11。

你可以修改为不同的参数后，再点击koishi控制台右上角的勾号，以使插件默认配置生效。

当用户使用`qq-music-桑帛云`指令，并且不指定【-q】选项的品质时，我们使用默认的品质配置。

交互示例：
**用户**：

```code
qq-music-桑帛云   <歌曲名称>  
```

**机器人**：

```code
这里是一个歌曲列表
```

**用户**：

```code
[选择的歌曲序号]
```

**机器人**：

```code
对应歌曲的下载链接，并且品质默认的控制台配置
```

## 更新日志

- **1.1.0**   与Music-downloadvoice-api插件对齐，使用ts重构。（好耶

- **0.1.5**   修复logger定义问题。

- **0.1.4**   修复配置项[waitTimeout]失效的问题。

- **0.1.3**  1.与Music-downloadvoice-api插件对齐：不再[let qqSongData  = null]与[let netEaseSongData  = null]。而改为默认的【暂无】，以防止API返回错误造成的报错。  2.[fetchSongDetails]与[fetchSongList]均添加默认返回值。 3.修复配置项[retryLimit]与[exitCommand]对用户返回的序号的容错对于指令【qq-music-桑帛云】不生效的问题。  4.与Music-downloadvoice-api插件对齐：增加配置项[MenuExitCommandTip,retryExitCommandTip]，以提示用户使用退出指令。

- **0.1.2**  1.增加配置项[retryLimit]与[exitCommand]增加用户返回的序号的容错。自定义序号容错时的退出指令。 2.修复之前[歌单发不出来，但是接下来还进行选择序号交互]的逻辑漏洞。

- **0.1.1**  与Music-downloadvoice-api插件对齐：1.整理配置项，新增分组[图片歌单设置]。2.新增配置项[textbrightness,backgroundbrightness,nightModeEnabled,nightModeStart,nightModeEnd,nightModeTextBrightness,nightModeBackgroundBrightness]  3.允许用户自定义设置歌单的字体、背景亮度。  4.新增夜间模式选项。  5.允许用户自定义设置夜间模式的歌单的字体、背景亮度。

- **0.1.0**  修复在【文本歌单】返回的情况下调用【music-downloadlink-星之阁】会返回两次文本歌单 的bug。

- **0.0.9**  1.修复配置项【waitTimeout】返回的数字不准确。 2.延长了【waitTimeout】配置项的默认时长至45秒。

- **0.0.8**  忘记说明QQ音乐下载链接的品质只能`qq-music-桑帛云`指令下生效了，现在控制台补上说明了。

- **0.0.7**  1.优化返回，图文合为一条消息返回，更简洁。 2.优化指令合并，使用子指令。 3.新增`qq-music-夏柔`支援QQ音乐点歌。4.支持用户自定义等待选择时间

- **0.0.6**  完善代码部分的小错误，忘记声明pptr服务了，现在没有warn了。Akisa大人说得对，小小学很佩服。

- **0.0.5**  支持图片化歌单返回

- **0.0.3**  加入lolimi的QQ音乐点歌，支持自选音质，最高支持母带音质

- **0.0.1**  music-downloadlink-api功能基本实现，通过API点歌并且返回下载链接。
