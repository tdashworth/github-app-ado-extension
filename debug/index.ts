import { App, Octokit } from 'octokit';
import fs from 'fs';
import { RequestParameters } from '@octokit/auth-app/dist-types/types';

async function run() {
  try {
    const privateKey = fs.readFileSync("C:\\code\\capgemini\\GitHubAppWrapper\\tdashworth-org-test-app.2022-12-16.private-key.pem").toString();
    const appId = 273256 //193564
    const repoOwner = "tdashworth"
    const repoName = "power-notify"

    const installationClient = await getInstallationClient(appId, privateKey, repoOwner, repoName);

    const response = await installationClient.rest.repos.createInOrg({
      name: "test-repo2",
      org: "TDAshworth-Org"
    })

    console.log(response.url)
    console.log(response.data)

  } catch (err) {
    throw err
  }
}

// @ts-ignore globalThis is required by octokit.
global.globalThis = this;

async function getInstallationClient(appId: number, privateKey: string, repoOwner: string, repoName: string): Promise<Octokit> {

  const appClient = new App({ appId, privateKey });

  // const installation = await appClient.octokit.rest.apps.getRepoInstallation({
  //   owner: repoOwner,
  //   repo: repoName
  // });

  return appClient.getInstallationOctokit(32282118);
}

run();