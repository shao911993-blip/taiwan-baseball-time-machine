# 主視覺生成紀錄

目前網站採用微修 v2：`assets/taipei-stadium-hero-v2.png`；本檔保留第一版生成記錄，微修提示詞見 [HERO_REFINEMENT.md](HERO_REFINEMENT.md)。

工具：內建 image_gen，非 CLI。日期：2026-10-16。

成品：`assets/taipei-stadium-hero.png`（1536×1024）。同一圖檔以 data URI 內嵌於 index.html 的 SVG，網站不依賴 assets 目錄即可離線執行。文字標題與圖說使用 UTF-8 HTML，沒有燒錄在圖片中。

參考圖：[運動視界文章所附臺北市立棒球場老照片](https://www.sportsv.net/articles/65792)。照片僅作建築與構圖參考，未嵌入網站。成圖為 AI 生成的藝術詮釋，不應作為精確建築復原或歷史照片使用。

## 實際使用的提示詞

Create one polished editorial architectural illustration for the hero of a Taiwan baseball history website. Reference image 1 is a historical architectural reference of the OLD Taipei Municipal Baseball Stadium, NOT an image to reproduce photographically. Use its actual elevated oblique viewpoint and recognizable building layout: the cream concrete Chinese palace style entrance with a dark tiled upturned roof and multiple archways at the LOWER LEFT foreground, curving covered grandstands across the foreground and right, exposed concrete terraces wrapping around the rear, a properly proportioned green baseball outfield and reddish dirt infield, tall slender lattice floodlight towers, and a restrained backdrop of Taipei's ordinary 1980s/1990s apartment blocks. Baseball field must be physically coherent, diamond and baselines correctly oriented with home plate by the covered foreground stands. The stadium must have architectural depth and credible nonuniform perspective, NOT a perfect oval bathtub, NOT flat primitive SVG blocks, NOT a toy stadium. Style: sophisticated hand-drawn travel poster / heritage architectural illustration, fine ink lines with screen printed color washes and delicate paper grain, warm ivory paper (#f5f0e4), deep forest green, muted sage, terracotta accents. Medium detailed and art directed; enough architectural detail to make the distinctive gate identifiable, while keeping a clear elegant silhouette readable on a website. Full stadium visible, complete entrance not cut off. Landscape 3:2 composition. Ivory negative space around outer silhouette; bright cream background, airy warm daylight. Avoid all text, labels, lettering, numerals, captions, logos and watermarks; website will render title as real HTML outside the art. Do not add modern Taipei 101 or domes. Do not copy the photograph's grain, photograph border or printed overlays. This is an original interpretive illustration, not a documentary reconstruction.
