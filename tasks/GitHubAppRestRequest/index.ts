import tl = require('azure-pipelines-task-lib/task');
import axios = require('axios');
import { App, Octokit } from 'octokit';
import { RequestParameters } from '@octokit/auth-app/dist-types/types';

async function run() {
  try {
    const privateKey = await getSecureFileContent('privateKey')
    const rawAppId = tl.getInputRequired('appId');
    const appId = parseInt(rawAppId);
    const repo = tl.getInputRequired('repo');
    const repoOwner = repo.split('/')[0];
    const repoName = repo.split('/')[1];
    const httpMethod = tl.getInputRequired('httpMethod');
    const url = tl.getInputRequired('url');
    const rawHeaders = tl.getInput('httpHeaders');
    const rawBody = tl.getInput('body');

    const options: RequestParameters & { method?: string | undefined; } & { url: string; } = {
      method: httpMethod,
      url: url,
      headers: rawHeaders && JSON.parse(rawHeaders)
    }
    const body = rawBody ? JSON.parse(rawBody) : {}

    const installationClient = await getInstallationClient(appId, privateKey, repoOwner, repoName);

    const response = await installationClient.request.defaults(options)(body)

    tl.setVariable("ResponseDataAsJson", `${JSON.stringify(response.data)}`, false, true);
    tl.debug(`Request made (Status: ${response.status})`);

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