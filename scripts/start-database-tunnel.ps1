param(
    [string]$KeyPath = 'D:\digitalent-ai\infra\terraform\digitalent_key.pem',
    [string]$SshHost = '18.142.12.139',
    [string]$SshUser = 'ubuntu',
    [int]$LocalPort = 5432
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot

function Test-TunnelPort {
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $pending = $client.ConnectAsync('127.0.0.1', $LocalPort)
        return $pending.Wait(1000) -and $client.Connected
    }
    catch { return $false }
    finally { $client.Dispose() }
}

if (Test-TunnelPort) {
    Write-Output "127.0.0.1:$LocalPort is already listening. No additional tunnel started."
    return
}

if (-not (Test-Path -LiteralPath $KeyPath -PathType Leaf)) {
    $fallbackKey = Join-Path (Split-Path -Parent $repositoryRoot) 'digitalent_key.pem'
    if (-not (Test-Path -LiteralPath $fallbackKey -PathType Leaf)) {
        throw 'SSH private key not found. Pass -KeyPath with the correct absolute path.'
    }
    $KeyPath = $fallbackKey
}
$resolvedKey = (Resolve-Path -LiteralPath $KeyPath).Path
$sshExecutable = (Get-Command ssh -ErrorAction Stop).Source
$scratchRoot = Join-Path $repositoryRoot 'scratch'
New-Item -ItemType Directory -Path $scratchRoot -Force | Out-Null
$errorLog = Join-Path $scratchRoot ('database-tunnel-' + [Guid]::NewGuid().ToString('N') + '.log')

# Keep the tunnel alive independently of this terminal. Bind only to the local machine.
# Quoting the key argument is necessary because Start-Process joins ArgumentList with spaces.
$sshArguments = @(
    '-N', '-T', '-i', ('"' + $resolvedKey + '"'),
    '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
    '-o', 'ExitOnForwardFailure=yes', '-o', 'ConnectTimeout=15',
    '-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3',
    '-L', "127.0.0.1:${LocalPort}:127.0.0.1:5432", "${SshUser}@${SshHost}"
)
$tunnelProcess = Start-Process -FilePath $sshExecutable -ArgumentList $sshArguments -WindowStyle Hidden -PassThru -RedirectStandardError $errorLog
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 500
    $tunnelProcess.Refresh()
    if ($tunnelProcess.HasExited) {
        $failure = Get-Content -LiteralPath $errorLog -Raw -ErrorAction SilentlyContinue
        throw "SSH tunnel could not start: $failure"
    }
    if (Test-TunnelPort) {
        Write-Output "SSH tunnel ready: 127.0.0.1:$LocalPort -> ${SshHost}:5432 (PID $($tunnelProcess.Id))."
        return
    }
}
throw "SSH tunnel did not become ready. Inspect $errorLog"
