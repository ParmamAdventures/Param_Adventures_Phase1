$ts = Get-Date -UFormat %s
$email = "test+$ts@example.com"
$body = @{ email = $email; password = 'Password123!'; name = 'Test User' } | ConvertTo-Json
try {
    $resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/auth/register' -ContentType 'application/json' -Body $body
    $resp | ConvertTo-Json -Depth 10
    Write-Output "REGISTERED:$email"
} catch {
    Write-Output "REQUEST_ERROR: $_"
}
