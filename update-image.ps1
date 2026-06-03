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
