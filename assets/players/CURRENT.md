# 目前使用的投打素材與修正

工具：內建 imagegen。網站人物圖為重繪插畫，球棒由 Canvas 繪製。

## 參考

使用者提供的三段影片：打擊（主審視角）、投球和打擊（打者視角）、投球和打擊（投球視角）。參考影格不內嵌在網站。

## 現行渲染

- batter-v3.png：人物不含球棒。源圖的抬腿姿勢不直接用於遊戲；第 0–6 格的下半身固定取自站姿，第 175–205 列做腰部接合。球棒獨立由 drawBatterBat 畫一次。
- pitcher-front.png：沿用正面鏡位素材，剔除側面源圖 5、6、7、8、19、20。24 個播放步驟共使用 18 張不同姿勢，包含定格停留；不是 24 張不同姿勢。保留每張人物完整頭身，沒有局部換頭。
- batter-verified.png、pitcher-verified.png：依實際 Canvas 裁切與合成呼叫產生的 QA 預覽。非瀏覽器截圖。
- verify-player-motion.cjs：檢查站姿腿部像素來源與落點一致、側面圖格排除、出手與擊球判定時間、裁切邊界。

## 打者去球棒與腳步修正提示詞

Edit this exact 1448x1086 baseball batter sprite sheet, 4 columns by 3 rows of 362x362 cells. Keep EXACT canvas dimensions and regular 4x3 cell layout, same athlete, uniform, helmet, catcher-camera viewpoint, lighting and scale.
TWO REQUIRED CORRECTIONS:
1. REMOVE EVERY BAT FROM EVERY CELL. Leave both gloved hands naturally together around an invisible bat handle. ZERO visible bats, ZERO detached bat pieces, ZERO motion trails or ghost bats anywhere. The game will render ONE bat separately. Keep hand/arm positions corresponding to the swing, remove only the bats themselves.
2. CORRECT LOWER BODY, especially top row cells2 and3 (zero-based). A baseball hitter does NOT kick his front knee outward like a pitcher. Use a quiet compact toe-tap/minimal stride: the rear foot stays planted in exactly its starting spot for frames0-6; the front heel rises at most a few centimeters, toes stay close to ground, knee remains pointing naturally in the foot's direction. In load/stride frames, do NOT raise the knee to waist or turn it sideways. Front foot moves only a short step FORWARD TOWARD PITCHER at top-right, NOT sideways outward into a huge split stance. Match a normal compact baseball batting stride. After contact rear heel pivots upward while toe remains planted; front leg braces, follow-through weight forward. Keep the feet baseline/stance consistent and head at same height between ready/load except slight knee flex. Preserve reference camera and no change to torso orientation aside from correct slight weight transfer.
All twelve poses remain a sequential single continuous right-handed swing, look toward distant pitcher at top-right. No face or torso turned toward a new side camera. At contact only two hands holding invisible handle in front of chest; arms extend through after contact. Same helmet, slate green jersey, ivory pants. Truly TRANSPARENT alpha background, no glows, backgrounds, shadows, text, borders, gridlines, equipment or loose objects. Exact twelve batless figures and no extra limbs.

## 影片參考重繪提示詞

Create a game sprite sheet of a baseball batter using these four actual VIDEO FRAMES as the authoritative pose and CAMERA references. Images 1-4 show ready, stride/load, contact, finish FROM THE UMPIRE CAMERA behind home plate. Faithfully preserve the reference CAMERA and spatial relationship to the distant pitcher. Horizontally MIRROR the referenced motion so the player stands on the LEFT of the plate and swings toward the TOP RIGHT distant pitcher. The head must look UPFIELD toward the distant pitcher, not sideways to the viewer's right. The bat moves in depth toward the plate. Do not substitute a textbook side-profile stance. Do not force the back squarely toward camera: match the natural oblique torso angle of the reference and its changes through the swing.
Change the athlete into a generic adult in forest/slate green jersey, ivory baseball pants, navy helmet and dark shoes; keep natural anatomy and accurate two-handed grip. Cohesive refined realistic illustrated shading, no logos.
Exactly 12 sequential poses in a 4-column by 3-row atlas, 1536x1152, equal 384x384 square cells. Reading order: row1 ready, slight load, front heel lift, stride; row2 plant, hips start rotation, barrel approaches ball, CONTACT; row3 extension, rising follow-through, high wrap, balanced finish. Interpolate natural intermediate poses from the four actual references. Consistent catcher camera and character size throughout, feet baseline at92% cell height, pelvis around50% cell width. COMPLETE body and COMPLETE bat INSIDE every cell, 5% padding, no overlap between cells, no cropped bat or shoes. TRUE TRANSPARENT alpha background. Remove ALL scene/background, text, UI, equipment other than ONE held bat, and extra people from reference. No camera movement, no grid or labels. Preserve reference batting mechanics and view direction while changing wardrobe and mirroring the original setup. Exactly twelve clean sprites.

