# 場地與站位校正

場地由 `src/games.js` 的 `fieldPoint` 統一投影，地面座標使用公尺。本壘、左右打擊區、壘線、壘包、投手丘與好球帶共用同一部攝影機，避免各自用螢幕座標繪製造成比例不一致。

- 打擊區為 1.2192 × 1.8288 公尺；打者以鞋底定位，準備至擊球階段兩腳維持在左側打擊區內。
- 本壘周圍為獨立紅土區；投手丘位於內野草皮上，不再用兩條紅土三角形連接本壘與投手丘。
- 好球帶水平寬度與同一投影下的本壘寬度一致。

尺寸參考：[MLB batter's box](https://www.mlb.com/glossary/rules/batters-box)、[MLB field dimensions](https://www.mlb.com/glossary/rules/field-dimensions)。

`field-verified.png` 是從實際 Canvas 繪圖呼叫重播產生的四階段構圖預覽，包含準備、蓄力、擊球與收棒；它不是瀏覽器截圖。重播使用 GDI，字型與抗鋸齒可能和瀏覽器不同。

驗證指令：`node verify-player-motion.cjs`、`node --check src/games.js`、`node build.cjs`。
