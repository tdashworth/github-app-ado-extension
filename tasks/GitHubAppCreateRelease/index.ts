import tl = require('azure-pipelines-task-lib/task');
import axios = require('axios');
import { App, Octokit } from 'octokit';

async function run() {
  try {
    const privateKey = await getSecureFileContent('privateKey')
    const rawAppId = tl.getInputRequired('appId');
    const appId = parseInt(rawAppId);
    const repoOwner = tl.getInputRequired('repoOwner');
    const repoName = tl.getInputRequired('repoName');
    const tagName = tl.getInputRequired('tagName');
    const targetCommitish = tl.getInputRequired('targetCommitish');
    const name = tl.getInput('name');
    const body = tl.getInput('body');
    const draft = tl.getBoolInput('draft');
    const prerelease = tl.getBoolInput('prerelease');
    const discussionCategoryName = tl.getInput('discussionCategoryName');
    const generateReleaseNotes = tl.getBoolInput('generateReleaseNotes');

    tl.debug(`private key: ${(privateKey ?? "").substring(0, 30)}...`);
    tl.debug(`appId: ${appId}`);
    tl.debug(`repoOwner: ${repoOwner}`);
    tl.debug(`repoName: ${repoName}`);
    tl.debug(`tagName: ${tagName}`);
    tl.debug(`targetCommitish: ${targetCommitish}`);
    tl.debug(`name: ${name}`);
    tl.debug(`body: ${body}`);
    tl.debug(`draft: ${draft}`);
    tl.debug(`prerelease: ${prerelease}`);
    tl.debug(`discussionCategoryName: ${discussionCategoryName}`);
    tl.debug(`generateReleaseNotes: ${generateReleaseNotes}`);

    const installationClient = await getInstallationClient(appId, privateKey, repoOwner, repoName);

    // https://docs.github.com/en/rest/releases/releases#create-a-release

    const response = await installationClient.rest.repos.createRelease({
      owner: repoOwner,
      repo: repoName,
      tag_name: tagName,
      target_commitish: targetCommitish,
      name: name,
      body: body,
      draft: draft,
      prerelease: prerelease,
      discussion_category_name: discussionCategoryName,
      generate_release_notes: generateReleaseNotes,
    });

    tl.setVariable("ReleaseId", `${response.data.id}`, false, true);
  } catch (err){
    tl.error(err as string)
    tl.setResult(tl.TaskResult.Failed, (err as Error)?.message ?? err)
  }
}

// @ts-ignore globalThis is required by octokit.
global.globalThis = this;

async function getSecureFileContent(name: string): Promise<string> {
  const id = tl.getInputRequired(name);
  const ticket = tl.getSecureFileTicket(id);
  const collectionUrl = tl.getVariable('System.TeamFoundationCollectionUri');
  const project = tl.getVariable('System.TeamProject');
  const token = tl.getVariable('System.AccessToken');
  const user = tl.getVariable('Build.QueuedById');

  const base64AuthInfo = Buffer.from(`${user}:${token}`, 'utf-8').toString('base64');

  const response = await axios.default.get(
    `${collectionUrl}${project}/_apis/distributedtask/securefiles/${id}?ticket=${ticket}&download=true&api-version=5.0-preview.1`,
    {
      headers: {
        Authorization: `Basic ${base64AuthInfo}`,
        Accept: "application/octet-stream"
      },
      responseType: 'blob',
    });

  return response.data
}

async function getInstallationClient(appId: number, privateKey: string, repoOwner: string, repoName: string): Promise<Octokit> {

  const appClient = new App({ appId, privateKey });

  const installation = await appClient.octokit.rest.apps.getRepoInstallation({
    owner: repoOwner,
    repo: repoName
  });

  return appClient.getInstallationOctokit(installation.data.id);
}

run();