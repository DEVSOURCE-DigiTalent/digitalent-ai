Add-Type -AssemblyName System.IO.Compression.FileSystem
$baseDir = "D:\Program Files\QLNS\QLNS\project_demo\dung_bam_vao_day"
$files = Get-ChildItem -Path $baseDir -Filter *.docx

foreach ($file in $files) {
    if ($file.Name -like "~$*") { continue }
    Write-Output "=== $($file.Name) ==="
    $zipPath = $file.FullName
    $tempDir = Join-Path -Path $env:TEMP -ChildPath (New-Guid).ToString()
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $tempDir)
    
    $xmlPath = Join-Path -Path $tempDir -ChildPath "word\document.xml"
    if (Test-Path $xmlPath) {
        [xml]$xml = Get-Content -Path $xmlPath -Raw
        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        
        $paragraphs = $xml.SelectNodes("//w:p", $ns)
        foreach ($p in $paragraphs) {
            $texts = $p.SelectNodes(".//w:t", $ns)
            $paraText = ""
            foreach ($t in $texts) {
                $paraText += $t.InnerText
            }
            if ($paraText -ne "") {
                Write-Output $paraText
            }
        }
    }
    Remove-Item -Path $tempDir -Recurse -Force
    Write-Output ""
    Write-Output "=================================================="
    Write-Output ""
}
