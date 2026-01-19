# Quick Error Message Replacement Script
# Replaces hardcoded error strings with ErrorMessages constants

$replacements = @{
    '"Trip not found"' = 'ErrorMessages.TRIP_NOT_FOUND'
    '"Blog not found"' = 'ErrorMessages.BLOG_NOT_FOUND'
    '"Booking not found"' = 'ErrorMessages.BOOKING_NOT_FOUND'
}

$files = @(
    'src/controllers/wishlist.controller.ts',
    'src/controllers/trips/getTripBySlug.controller.ts',
    'src/controllers/payments/refundBooking.controller.ts',
    'src/controllers/payments/initiatePayment.controller.ts',
    'src/controllers/payments/getPaymentStatus.controller.ts',
    'src/controllers/payments/createManualPayment.controller.ts',
    'src/controllers/payments/createPaymentIntent.controller.ts',
    'src/controllers/blogs/getBlogById.controller.ts',
    'src/controllers/blogs/updateBlog.controller.ts',
    'src/controllers/blogs/rejectBlog.controller.ts',
    'src/controllers/blogs/publishBlog.controller.ts',
    'src/controllers/blogs/submitBlog.controller.ts',
    'src/controllers/blogs/getBlogBySlug.controller.ts',
    'src/controllers/blogs/approveBlog.controller.ts',
    'src/controllers/bookings/downloadInvoice.controller.ts',
    'src/controllers/bookings/approveBooking.controller.ts',
    'src/controllers/bookings/rejectBooking.controller.ts',
    'src/controllers/media/setTripGallery.controller.ts',
    'src/controllers/admin/trip-assignment.controller.ts',
    'src/controllers/admin/listTripBookings.controller.ts',
    'src/controllers/admin/getTripBookings.controller.ts'
)

$changedFiles = @()

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalContent = $content
        $needsImport = $false
        
        foreach ($find in $replacements.Keys) {
            if ($content -match [regex]::Escape($find)) {
                $content = $content -replace [regex]::Escape($find), $replacements[$find]
                $needsImport = $true
            }
        }
        
        # Add import if needed and not already present
        if ($needsImport -and $content -notmatch 'ErrorMessages') {
            # Find the last import line
            if ($content -match '(?m)^import .+;$') {
                $lastImport = $Matches[0]
                $content = $content -replace [regex]::Escape($lastImport), "$lastImport`r`nimport { ErrorMessages } from ""../../constants/errorMessages"";"
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            $changedFiles += $file
            Write-Host "✓ Updated: $file" -ForegroundColor Green
        }
    }
}

Write-Host "`n✅ Replaced error messages in $($changedFiles.Count) files" -ForegroundColor Cyan
Write-Host "Files changed:" -ForegroundColor Yellow
$changedFiles | ForEach-Object { Write-Host "  - $_" }
