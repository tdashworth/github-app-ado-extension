import tl = require('azure-pipelines-task-lib/task');
import axios = require('axios');
import { App, Octokit } from 'octokit';

async function run() {
  try {
    const privateKey = await getSecureFileContent('privateKey')
    const rawAppId = tl.getInputRequired('appId');
    const appId = parseInt(rawAppId);
    const repo = tl.getInputRequired('repo');
    const repoOwner = repo.split('/')[0];
    const repoName = repo.split('/')[1];

    const installationClient = await getInstallationClient(appId, privateKey, repoOwner, repoName);

    //[to update]
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