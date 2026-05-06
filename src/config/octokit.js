import { Octokit } from "@octokit/rest";
import { GITHUB_TOKEN } from "../utils/env.js";

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export { octokit };
