echo "Building GitHubAppCreateIssueComment..."
cd "$PSScriptRoot/tasks/GitHubAppCreateIssueComment"
npm install
tsc

echo "Building GitHubAppDeleteIssueComment..."
cd "$PSScriptRoot/tasks/GitHubAppDeleteIssueComment"
npm install
tsc

echo "Building Extension..."
cd "$PSScriptRoot"
tfx extension create -manifest-globs vss-extension.json --output-path bin/TDAswhorth.GitHubAppClient.vsix

echo "Done."