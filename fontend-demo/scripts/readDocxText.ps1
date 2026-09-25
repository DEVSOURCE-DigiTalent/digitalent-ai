param(
  [Parameter(Mandatory=$true)][string]$DocPath,
  [string]$Pattern = '.',
  [int]$Context = 0,
  [string]$OutputPath = ''
)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolved = (Resolve-Path -LiteralPath $DocPath).Path
$archive = [System.IO.Compression.ZipFile]::OpenRead($resolved)
try {
  $entry = $archive.GetEntry('word/document.xml')
  $reader = [System.IO.StreamReader]::new($entry.Open(), [System.Text.Encoding]::UTF8)
  try { [xml]$document = $reader.ReadToEnd() } finally { $reader.Dispose() }
  $manager = [System.Xml.XmlNamespaceManager]::new($document.NameTable)
  $manager.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $paragraphs = @($document.SelectNodes('//w:p', $manager) | ForEach-Object {
    $items = $_.SelectNodes('.//w:t', $manager)
    ($items | ForEach-Object { $_.InnerText }) -join ''
  } | Where-Object { $_ -and $_.Trim() })
  if ($OutputPath) {
    $paragraphs | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
    return
  }
  $shown = @{}
  for ($i=0; $i -lt $paragraphs.Count; $i++) {
    if ($paragraphs[$i] -match $Pattern) {
      $from = [Math]::Max(0,$i-$Context)
      $to = [Math]::Min($paragraphs.Count-1,$i+$Context)
      for ($j=$from; $j -le $to; $j++) {
        if (-not $shown.ContainsKey($j)) { Write-Output ("{0}: {1}" -f ($j+1), $paragraphs[$j]); $shown[$j] = $true }
      }
    }
  }
} finally { $archive.Dispose() }
