param([int]$FrameCount=12)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaClip,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.MediaComposition,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Editing.VideoFramePrecision,Windows.Media.Editing,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.DataReader,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null
function Await-WinRT($Operation,[type]$ResultType){
  $method=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
  $task=$method.MakeGenericMethod($ResultType).Invoke($null,@($Operation))
  $task.GetAwaiter().GetResult()
}
$references=@(
  @{id='umpire';path='C:/Users/User/Downloads/打擊(主審視角).mp4'},
  @{id='batter';path='C:/Users/User/Downloads/投球和打擊(打者視角).mp4'},
  @{id='pitcher';path='C:/Users/User/Downloads/投球和打擊(投球視角).mp4'}
)
$outputRoot=Join-Path $PSScriptRoot 'assets/motion-reference'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
foreach($reference in $references){
  $videoPath=[IO.Path]::GetFullPath($reference.path)
  $file=Await-WinRT ([Windows.Storage.StorageFile]::GetFileFromPathAsync($videoPath)) ([Windows.Storage.StorageFile])
  $clip=Await-WinRT ([Windows.Media.Editing.MediaClip]::CreateFromFileAsync($file)) ([Windows.Media.Editing.MediaClip])
  $composition=New-Object Windows.Media.Editing.MediaComposition
  $clipList=[System.Collections.Generic.IList[Windows.Media.Editing.MediaClip]]$composition.Clips
  $clipList.Add($clip)
  $duration=$clip.OriginalDuration.TotalSeconds
  $sheet=New-Object System.Drawing.Bitmap(1280,([int][Math]::Ceiling($FrameCount/4)*210))
  $graphics=[System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::FromArgb(245,240,229))
  $font=New-Object System.Drawing.Font('Arial',11)
  for($frame=0;$frame -lt $FrameCount;$frame++){
    $seconds=$duration*($frame+.25)/$FrameCount
    $stream=Await-WinRT ($composition.GetThumbnailAsync([TimeSpan]::FromSeconds($seconds),640,360,[Windows.Media.Editing.VideoFramePrecision]::NearestFrame)) ([Windows.Graphics.Imaging.ImageStream])
    $reader=New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
    [void](Await-WinRT ($reader.LoadAsync([uint32]$stream.Size)) ([uint32]))
    $bytes=New-Object byte[] ([int]$stream.Size)
    $reader.ReadBytes($bytes)
    $framePath=Join-Path $outputRoot ($reference.id+'-'+$frame.ToString('00')+'.jpg')
    [IO.File]::WriteAllBytes($framePath,$bytes)
    $memory=New-Object IO.MemoryStream(,$bytes)
    $image=[System.Drawing.Image]::FromStream($memory)
    $x=($frame%4)*320;$y=[Math]::Floor($frame/4)*210
    $graphics.DrawImage($image,[int]$x,[int]$y,320,180)
    $graphics.DrawString(('{0:00}  {1:0.00}s' -f $frame,$seconds),$font,[System.Drawing.Brushes]::Black,[single]($x+8),[single]($y+186))
    $image.Dispose();$memory.Dispose();$reader.Dispose();$stream.Dispose()
  }
  $graphics.Dispose();$font.Dispose()
  $sheet.Save((Join-Path $outputRoot ($reference.id+'-sheet.jpg')),[System.Drawing.Imaging.ImageFormat]::Jpeg)
  $sheet.Dispose()
  Write-Output ($reference.id+': '+[Math]::Round($duration,3)+' seconds; '+$FrameCount+' frames extracted')
}
