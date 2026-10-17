# 線審體驗重設

內建 imagegen 產生並保存於專案：

- `line-judge-stadium-v1.png`：有草皮紋理、看台、外野圍牆與警戒區的背景。
- `line-umpire-v1.png`：界外側、背面斜側觀察姿勢的線審，透明素材。
- `line-verified.png`：準備、飛行、擦線回看及界外回看的 Canvas 指令合成預覽，非瀏覽器截圖。

白線、界外標竿、球、落點標記與放大窗由程式繪製。實際白線位置和寬度共用 `LINE_VIEW` 判定；碰到線即算界內，練習範圍明確限定在一壘以外的第一落地點。

`lineBallPose` 統一飛行、觸地及彈跳滾動，避免同時繪製停在落點的球和滾動中的球。答案只在判決後揭露；可用按鈕或 R 鍵以0.35倍速回看最後飛行與落地過程。放大窗依落點與白線距離調整倍率，保持球和線都可見。

驗證：`node .tools/verify-line-game.cjs`。涵蓋邊界擦線判定、第一次觸地、單球繪製、答案隱藏、球次、逾時、慢動作回看、八球結算和重新開始。

## 背景提示詞

Use case: stylized-concept. Asset type: empty premium baseball outfield foul-line training game backdrop. Wide16:9 landscape1600x900. Elevated overhead camera looking straight ALONG the right-field foul line toward the outfield wall. Camera aimed down enough to clearly judge a ball's first contact on grass. The code overlays a perfectly straight vertical chalk line at EXACTLY50% width from y22% to bottom, and one foul pole at50% width on wall. Therefore DO NOT paint any white lines or any poles. NO balls, players, umpires, bases, bats, equipment, text, numbers, logos, UI or diagrams.
Composition: detailed tiered spectator seating in upper12% only, miniature blurred crowd and aisles under warm evening stadium lighting, forest-green padded outfield fence horizontal y12%-18%, narrow terracotta warning track y18%-22% and rich natural green outfield grass covering lower78%. Both sides of future central foul line are GRASS. Left half is fair territory, right half is foul territory. Do not draw a baseball diamond, pitcher mound, home plate, triangle dirt road, or any visible chalk marks. The central action area y35%-70% must be unobstructed turf for ball landing, no foreground decorations. Texture must be beautifully tactile high quality realistically painted sports game illustration: individual fine grass grain and subtly varied grass tones, gentle broad diagonal mowing bands with nuanced lighting instead of flat green rectangles, tiny realistic turf wear, stadium wall padded seams, railings and seating details. Muted forest green, blue slate, warm sand palette, coherent realistic scale and elevated perspective; quiet lighting so a small ivory baseball remains clear against grass. No giant dramatic sky or light bloom, no pixel art, no flat geometric diagram, no stylized checkerboard pattern. Background only, all game markings added with code afterward.

## 線審提示詞

Use case: stylized-concept. Asset type: transparent character cutout for a premium baseball line-judge training game. Exactly ONE adult FIELD UMPIRE, full body centered, wearing charcoal black short-sleeved umpire polo with subtle sleeve piping, gray trousers, black belt, black cap and black athletic shoes. NO catcher mask, NO chest/shin armor, NO glove, ball or bat. He is an outfield line umpire, not a home plate umpire. Athletic ready stance with slight knee bend and slight forward lean, hands resting naturally just above knees, feet shoulder-width and grounded. CAMERA elevated at about40 degrees looking diagonally DOWN onto umpire from BEHIND AND TO HIS RIGHT. We primarily see the BACK and right shoulder/side, with head turned slightly LEFT, looking AWAY toward UPPER-LEFT of image along a distant foul line. He must not face the viewer, no frontal portrait, no arms signalling safe/out. Natural correct human anatomy, two arms, two legs, no exaggerated squat. Premium realistic painted sports editorial game illustration, fine uniform folds, subtle cap/seam highlights, warm stadium light from upper left, matches natural detailed baseball illustration. Isolate full figure and both complete shoes with generous10% transparent padding, true transparent alpha background, no floor, turf, cast shadow, text, numbers or logos. Portrait composition.

