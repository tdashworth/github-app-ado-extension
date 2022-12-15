Write-Output "Installing typescript..."
npm install -g typescript

Get-ChildItem -Path "$PSScriptRoot/tasks/" | Where-Object { $_.Name -ne "_Template" } | ForEach-Object {
  Write-Output "Building $_..."
  Set-Location "$PSScriptRoot/tasks/$_"
  npm install
  tsc
}

Write-Output "Building Extension..."
Set-Location "$PSScriptRoot"
npx tfx-cli extension create -manifest-globs vss-extension.json --output-path bin/TDAswhorth.GitHubAppClient.vsix

Write-Output "Done."