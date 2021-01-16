const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

const { run } = require('./lib/');

const CWD = process.cwd();
const DIST = path.join(CWD, '_site');
const POSTS = path.join(DIST, 'posts');
const PAGES = path.join(CWD, 'pages');
const TEMPLATES = path.join(CWD, 'templates');
// No shorthand, because otherwise `ncc build` fails...
const paths = { DIST: DIST, POSTS: POSTS, PAGES: PAGES, TEMPLATES: TEMPLATES };

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

console.log(execSync(`ls -lah ${CWD}`).toString('utf8'));

run({ paths, octokit, repo, userOptions }).then(
  () => console.log('Successfully built Microblog'),
  (err) => {
    console.log(err.message);
    console.log(err.stack);
  }
);
