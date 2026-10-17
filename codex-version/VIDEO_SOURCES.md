# 棒球放映室來源

查核日期：2026-10-16。以 YouTube 官方 oEmbed 回覆交叉確認以下三支影片標題、作者均為「緯來體育台」，頻道皆為 https://www.youtube.com/@vlsports 。未聲稱已觀看全片或驗證本機嵌入實際播放。

| 集數 | 官方標題 | 原始影片 |
| --- | --- | --- |
| EP5 | 【#棒球故事挖古挖古】EP5 生涯首轟(一)｜英雄們的青澀時期 每一個傳奇篇章的開始 | https://www.youtube.com/watch?v=JGF6c3aegWk |
| EP14 | 【#棒球故事挖古挖古】EP14 火爆球場之教練的怒號！ | https://www.youtube.com/watch?v=2o5ul2Iyj2o |
| EP26 | 【#棒球故事挖古挖古】EP26｜ 中華職棒不可思議事件簿 | https://www.youtube.com/watch?v=yZrzE59h-z4 |

僅透過 youtube-nocookie.com 原播放器嵌入，未下載、重新上傳、剪輯或擷取影片畫面。頁面預設不建立 iframe，使用者選集後才載入，沒有 autoplay 參數。切換集數取代原 iframe；關閉播放器移除 iframe，停止串流及播放。選片短介為本站簡述，非節目逐字稿。影片為跨年代補充閱讀，不依網頁所選年份誤標成當年影像。

使用者後續截圖已確認出現 YouTube 錯誤 153。依 [YouTube 官方說明](https://support.google.com/youtube/answer/171780?hl=zh-Hant) 與 [嵌入播放器來源識別要求](https://developers.google.com/youtube/terms/required-minimum-functionality#api-client-identity-and-credentials)，缺少 HTTP Referer 會造成此錯誤。單純設定 iframe 的 referrerpolicy 無法讓 file:// 產生 HTTP 網站來源。

已新增 serve.cjs 與「啟動網站.cmd」，以本機 HTTP 網址開啟網站，並設定官方建議的 strict-origin-when-cross-origin Referrer-Policy。來源由瀏覽器依實際網址提供，沒有填入虛構來源或代理影片。file:// 模式現在顯示啟動說明與所選影片連結，不建立 iframe。

地區、原作者設定、瀏覽器阻擋來源資訊及 YouTube 政策仍可能使播放受限。原影片連結始終保留。基礎網站仍可離線操作，線上影片需要網路。HTTP 服務及程式分支已實測；此環境沒有可用瀏覽器，尚未確認 YouTube 實際播放成功。
