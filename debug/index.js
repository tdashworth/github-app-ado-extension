"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const octokit_1 = require("octokit");
const fs_1 = __importDefault(require("fs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const privateKey = fs_1.default.readFileSync("C:\\code\\capgemini\\GitHubAppWrapper\\tdashworth-org-test-app.2022-12-16.private-key.pem").toString();
            const appId = 273256; //193564
            const repoOwner = "tdashworth";
            const repoName = "power-notify";
            const installationClient = yield getInstallationClient(appId, privateKey, repoOwner, repoName);
            const response = yield installationClient.rest.repos.createInOrg({
                name: "test-repo2",
                org: "TDAshworth-Org"
            });
            console.log(response.url);
            console.log(response.data);
        }
        catch (err) {
            throw err;
        }
    });
}
// @ts-ignore globalThis is required by octokit.
global.globalThis = this;
function getInstallationClient(appId, privateKey, repoOwner, repoName) {
    return __awaiter(this, void 0, void 0, function* () {
        const appClient = new octokit_1.App({ appId, privateKey });
        // const installation = await appClient.octokit.rest.apps.getRepoInstallation({
        //   owner: repoOwner,
        //   repo: repoName
        // });
        return appClient.getInstallationOctokit(32282118);
    });
}
run();
