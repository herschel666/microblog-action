const core = require('@actions/core');
const github = require('@actions/github');

const { run } = require('./lib/');

const token = core.getInput('repo-token', { required: true });
const title = core.getInput('title');
const basePath = core.getInput('base-path');
const postsPerPage = core.getInput('posts-per-page');
const { repo } = github.context;
const octokit = github.getOctokit(token);
const userOptions = {
  ...(title ? { title } : undefined),
  ...(basePath ? { basePath } : undefined),
  ...(postsPerPage ? { postsPerPage } : undefined),
};

run({ octokit, repo, userOptions }).then(
  () => console.log('Successfully built Microblog'),
  (err) => {
    console.log(err.message);
    console.log(err.stack);
  }
);
