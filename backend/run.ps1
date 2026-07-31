$ErrorActionPreference = "Stop"

function Find-Jdk21Plus {
    $candidates = @()

    $searchPatterns = @(
        "C:\Program Files\Eclipse Adoptium\jdk-21*",
        "C:\Program Files\Eclipse Adoptium\jdk-22*",
        "C:\Program Files\Java\jdk-21*",
        "C:\Program Files\Microsoft\jdk-21*"
    )

    foreach ($pattern in $searchPatterns) {
        $candidates += Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { $_.FullName }
    }

    foreach ($path in $candidates | Select-Object -Unique) {
        if (Test-Path (Join-Path $path "bin\java.exe")) {
            return $path
        }
    }

    if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
        return $env:JAVA_HOME
    }

    return $null
}

$jdkHome = Find-Jdk21Plus
if (-not $jdkHome) {
    Write-Host ""
    Write-Host "ERRO: JDK 21+ nao encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Spring Boot 3.5 exige Java 21. O Maven esta usando Java 8 (class file 52.0)." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Instale o Temurin 21:" -ForegroundColor Cyan
    Write-Host "  winget install EclipseAdoptium.Temurin.21.JDK" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou defina JAVA_HOME manualmente:" -ForegroundColor Cyan
    Write-Host '  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"' -ForegroundColor White
    Write-Host ""
    exit 1
}

$env:JAVA_HOME = $jdkHome
$env:PATH = "$jdkHome\bin;$env:PATH"

Write-Host "Usando JAVA_HOME: $jdkHome" -ForegroundColor DarkGray

$portInUse = netstat -ano | Select-String ":8080\s.*LISTENING"
if ($portInUse -and ($args.Count -eq 0 -or ($args -contains "spring-boot:run"))) {
    Write-Host ""
    Write-Host "AVISO: A porta 8080 ja esta em uso." -ForegroundColor Yellow
    Write-Host "Provavelmente ha outra instancia do back-end rodando." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Encerre o processo anterior:" -ForegroundColor Cyan
    $blockingPid = ($portInUse.ToString() -split '\s+')[-1]
    Write-Host "  Stop-Process -Id $blockingPid -Force" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou use outra porta:" -ForegroundColor Cyan
    Write-Host '  $env:SERVER_PORT = "8081"; .\run.cmd' -ForegroundColor White
    Write-Host ""
    exit 1
}

Push-Location $PSScriptRoot
try {
    if ($args.Count -gt 0) {
        & .\mvnw.cmd @args
    } else {
        & .\mvnw.cmd spring-boot:run
    }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
