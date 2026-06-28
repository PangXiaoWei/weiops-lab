# WeiOps Lab 高质量英文发音

这个项目的英文小喇叭采用两层策略：

1. 优先播放 `public/audio/en-us/ops/` 里的本地 MP3。
2. 如果 MP3 不存在或加载失败，自动使用浏览器 Web Speech API 的美式英语朗读。

## 使用 OpenAI TTS 生成 MP3

1. 在项目根目录复制 `.env.example`，新建 `.env.local`。
2. 把你的 key 填到 `.env.local`：

```env
OPENAI_API_KEY=你的_key
```

3. 先双击 `check-audio.bat`，只检查缺失音频，不会调用 API。
4. 再双击 `generate-audio-test.bat`，只生成前 10 条，用来测试。
5. 确认没问题后，双击 `generate-audio.bat`，只生成缺失 MP3，不会重复生成已有文件。

不要把 `.env.local` 提交到 GitHub。
