const core = require('@actions/core');
const github = require('@actions/github');

const { run } = require('./lib/');

const token = core.getInput('repo-token');
const postsPerPage = core.getInput('posts-per-page');
const { repo } = github.context;
const octokit = github.getOctokit(token);

run({ octokit, repo, postsPerPage }).then(
  () => console.log('Successfully built Microblog'),
  (err) => {
    console.log(err.message);
    console.log(err.stack);
  }
);
