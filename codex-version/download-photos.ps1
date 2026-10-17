$ErrorActionPreference = 'Stop'
$photoDirectory = Join-Path (Get-Location) 'assets/photos'
New-Item -ItemType Directory -Path $photoDirectory -Force | Out-Null
$files = @(
    @{ id='chen2016'; title='總統出席陳金鋒日開球及觀賞球賽 (26988598243).jpg'; flickr='https://www.flickr.com/photos/presidentialoffice/26988598243' },
    @{ id='dragons2024'; title='03.21 總統偕同副總統接見「2023年中華職棒總冠軍味全龍 」 - 53600944521.jpg'; flickr='https://www.flickr.com/photos/presidentialoffice/53600944521' },
    @{ id='lin2024'; title='03.21 總統偕同副總統接見「2023年中華職棒總冠軍味全龍 」 - 53601413670.jpg'; flickr='https://www.flickr.com/photos/presidentialoffice/53601413670' },
    @{ id='taiwan2024'; title='2024.11.26 中華民國總統接見「2024年世界棒球12強賽代表隊」 (54165913678).jpg'; flickr='https://www.flickr.com/photos/presidentialoffice/54165913678' }
)
$metadata = @()
foreach ($file in $files) {
    $title = [uri]::EscapeDataString('File:' + $file.title)
    $url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=1000&titles=' + $title
    $response = Invoke-RestMethod -Uri $url -Headers @{ 'User-Agent'='TaiwanBaseballHistory/1.0 (local educational project)' }
    $page = @($response.query.pages.PSObject.Properties)[0].Value
    if (-not $page.imageinfo) { throw ('Missing image: ' + $file.title) }
    $info = $page.imageinfo[0]
    $destination = Join-Path $photoDirectory ($file.id + '.jpg')
    try { $oembed = Invoke-RestMethod -Uri ('https://www.flickr.com/services/oembed/?format=json&maxwidth=1000&url=' + [uri]::EscapeDataString($file.flickr)) }
    catch { Write-Output ($file.id + ': original source unavailable; skipped'); continue }
    $imageUrl = $oembed.thumbnail_url -replace '_q\.jpg$', '_b.jpg'
    Invoke-WebRequest -Uri $imageUrl -OutFile $destination -Headers @{ 'User-Agent'='TaiwanBaseballHistory/1.0' }
    $metadata += @{ id=$file.id; title=$file.title; page=$info.descriptionurl; imageUrl=$imageUrl; originalUrl=$info.url; metadata=$info.extmetadata }
    Write-Output ($file.id + ': ' + $info.extmetadata.LicenseShortName.value)
}
$metadata | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 (Join-Path $photoDirectory 'metadata.json')
