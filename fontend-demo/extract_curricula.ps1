Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @(
  "khung-chuong-trinh-15-khoa-digcomp.docx",
  "giaotrinh-linhvuc1.docx",
  "giaotrinh-linhvuc2.docx",
  "giaotrinh-linhvuc3.docx",
  "giaotrinh-linhvuc4.docx",
  "giaotrinh-linhvuc5.docx"
)

$outputFile = "D:\Program Files\QLNS\QLNS\project_demo\all_curricula.txt"
if (Test-Path $outputFile) { Remove-Item $outputFile }

foreach ($name in $files) {
    $fullPath = Join-Path "D:\Program Files\QLNS\QLNS\project_demo\dung_bam_vao_day" $name
    if (-not (Test-Path $fullPath)) { continue }
    
    Add-Content -Path $outputFile -Value "========================================" -Encoding utf8
    Add-Content -Path $outputFile -Value "FILE: $name" -Encoding utf8
    Add-Content -Path $outputFile -Value "========================================" -Encoding utf8
    
    $tempDir = Join-Path $env:TEMP (New-Guid).ToString()
    try {
        [System.IO.Compression.ZipFile]::ExtractToDirectory($fullPath, $tempDir)
        $xmlPath = Join-Path $tempDir "word\document.xml"
        if (Test-Path $xmlPath) {
            [xml]$xml = Get-Content $xmlPath -Raw
            $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
            $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
            
            $nodes = $xml.SelectNodes("//w:p", $ns)
            foreach ($p in $nodes) {
                $textNodes = $p.SelectNodes(".//w:t", $ns)
                $line = ""
                foreach ($t in $textNodes) { $line += $t.InnerText }
                if ($line.Trim() -ne "") {
                    Add-Content -Path $outputFile -Value $line -Encoding utf8
                }
            }
        }
    } catch {
        Add-Content -Path $outputFile -Value "Error reading $name : $_" -Encoding utf8
    } finally {
        if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    }
}
Write-Output "Done extracting all curricula."
