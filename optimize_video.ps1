# 优化视频脚本
# 原因：Motion Canvas 渲染时需要频繁跳转视频帧（Seek）。普通视频包含大量 B帧/P帧（帧间压缩），解码第N帧需要先解码前面的帧，导致渲染极慢。
# 解决方案：将视频转码为 All-Intra（全关键帧）格式，每一帧都是独立的，极大提升 Seek 速度。

$inputFile = "workspace\assets\Nintendo Switch 2宣传片.mp4"
$outputFile = "workspace\assets\ns2_intra.mp4"
$ffmpegPath = "D:\Software\ffmpeg-8.0-full_build\bin\ffmpeg.exe"

Write-Host "正在优化视频：$inputFile -> $outputFile"
Write-Host "这将把视频转码为全关键帧格式 (GOP=1)..."

# -g 1: 关键帧间隔为1
# -keyint_min 1: 最小关键帧间隔为1
# -scenecut 0: 禁用场景切换检测
& $ffmpegPath -i $inputFile -c:v libx264 -g 1 -keyint_min 1 -scenecut 0 -crf 23 -c:a copy $outputFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 视频优化成功！"
    Write-Host "请修改 workspace/intro.tsx，将视频源更改为：import ns2Video from './assets/ns2_intra.mp4';"
} else {
    Write-Host "❌ 视频优化失败，请确保已安装 ffmpeg 并添加到 PATH。"
}
