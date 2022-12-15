# GitHub App Client For Azure Pipelines

## Purpose

This project delivers a Visual Studio extension for Azure Pipelines to call the GitHub API as a GitHub App (bot). This can be useful if you want to automatically comment on an issue/PR or create a release without it being tidied to someone's personal account. 

> As an example, as part of a PR, you might spin up a temporary environment to valid the changes and this extension allows you to comment as as "service" rather than a person. 

## Prerequisites

### 1. Install extension 

First things first, you need to install the extension into your Azure DevOps organisation. Click [here](https://marketplace.visualstudio.com/items?itemName=TDAshworth.GitHubAppClient) to begin. 

### 2. Create GitHub App

If you don't already have a GitHub App created, you can learn how to achieve this [here](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app). Please ensure it has the permissions required for the tasks/actions you intend to use e.g. `Pull Request: Read and Write` to comment on PRs.

> To use the app you will need the **App Id** (an integer value) and a **Private Key**. The Private Key must be uploaded to Azure Pipeline Libraries which can be done following [this guide](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/secure-files?view=azure-devops). The App Id could also be added to a variable group but is not required. 

### 3. Install GitHub App

The app must be installed in either the repo being accessed or the entire organisation which [this guide](https://docs.github.com/en/developers/apps/managing-github-apps/installing-github-apps) explains.

## Usage

### Comment on an Issue/PR

```yml
steps:
- task: GitHubAppCreateIssueComment@1
  name: CreateComment
  inputs:
    privateKey: 'github-app.private-key.pem'
    appId: 123456
    repo: $(Build.Repository.Name) # format should be `owner/repo`
    issueId: 1 # optional (defaults to pr id if available), this can be an issue or a PR
    body: > # multiple lines and markdown supported.
      ### Example Comment

      This is a comment made by my **bot** via Azure Pipelines! 
```

> Note: this task outputs the ID of the comment (`CommentId`) so that it can be deleted later if required. You can see this in action in [Delete Comment on an Issue/PR](#delete-comment-on-an-issuepr).

### Delete Comment on an Issue/PR

```yml
steps:
- task: GitHubAppDeleteIssueComment@1
  condition: ne(CreateComment.CommentId, '') # this skips the step if the comment id could not be found
  inputs:
    privateKey: 'github-app.private-key.pem'
    appId: 123456
    repo: $(Build.Repository.Name) # format should be `owner/repo`
    commentId: $(CreateComment.CommentId)
    #`CreateComment` comes from the name property of the `GitHubAppCreateIssueComment` task
```

### Create a Release

```yml
steps:
- task: GitHubAppCreateRelease@1
  inputs:
    privateKey: 'github-app.private-key.pem'
    appId: 123456
    repo: $(Build.Repository.Name) # format should be `owner/repo`
    tagName: 'v1.0.0'
    targetCommitish: '$(Build.SourceVersion)' # optional
    name: 'Example Release' # optional
    body: > # optional, multiple lines and markdown supported.
      ### Example Release

      This is a release made by my **bot** via Azure Pipelines!
    draft: false # optional
    prerelease: false # optional
    discussionCategoryName: 'some category name' # optional
    generateReleaseNotes: false # optional
    assets: ./release-assets # optional, can be a single file or a folder where all root files are uploaded
```

> Note: this task outputs the ID of the release (`ReleaseId`).

### REST Request

```yml
steps:
- task: GitHubAppRestRequest@0
  inputs:
    privateKey: 'github-app.private-key.pem'
    appId: 123456
    repo: $(Build.Repository.Name) # format should be `owner/repo`
    httpMethod: 'GET'
    url: '/repos/tdashworth/github-app-ado-extension'
    httpHeaders: '{ "content-type": "application/json;" }' # optional. as json
    body: '{ "key": "value" }' # optional, as json
```

> Note: this task outputs the response data as JSON (`ResponseDataAsJson`).

## Contribution

While the extension only supports the above actions so far, it's fairly trivial to add more. Please raise an issue requesting the action you desire or give it ago yourself and raise a PR!