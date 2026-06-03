param(
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

if (-not (Test-Path -LiteralPath $ImagePath)) {
    Write-Error "File not found: $ImagePath"
    exit 1
}

# Determine MIME type from extension
$ext = [System.IO.Path]::GetExtension($ImagePath).ToLower()
$mime = switch ($ext) {
    '.png'  { 'image/png' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.gif'  { 'image/gif' }
    '.webp' { 'image/webp' }
    default { 'image/png' }
}

# Convert image to base64
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $ImagePath).Path)
$base64 = [System.Convert]::ToBase64String($bytes)

Write-Host "=== Step 1: Replace driss.png with new image ==="
Copy-Item -LiteralPath $ImagePath -Destination "driss.png" -Force
Write-Host "Copied new image to driss.png"

Write-Host "=== Step 2: Update index_1.html base64 data URI ==="
$index1Path = "index_1.html"
$content = Get-Content -LiteralPath $index1Path -Raw

# Build new src attribute
$newSrc = "data:$mime;base64,$base64"

# Replace the old src attribute value - match between src=" and " alt="Driss El Aliti"
$regex = '(src=")data:image/png;base64,[^"]*(" alt="Driss El Aliti")'
$newContent = $content -replace $regex, ('${1}' + $newSrc + '${2}')

if ($newContent -eq $content) {
    Write-Warning "Could not find the old base64 string in index_1.html. Trying alternative pattern..."
    # More general pattern
    $regex2 = '(src=")[^"]*(" alt="Driss El Aliti")'
    $newContent = $content -replace $regex2, ('${1}' + $newSrc + '${2}')
}

Set-Content -LiteralPath $index1Path -Value $newContent -NoNewline
Write-Host "Updated index_1.html with new base64 image data"

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Both driss.png and index_1.html have been updated."
