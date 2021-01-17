const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

const { run } = require('./lib/');

const CWD = execSync('pwd').toString('utf8').trim();
const DIST = path.join(CWD, '_site');
const POSTS = path.join(DIST, 'posts');
const PAGES = path.join(CWD, 'pages');
const STATIC = path.join(CWD, 'static');
const TEMPLATES = path.join(__dirname, 'templates');
// No shorthand for TEMPLATES, because otherwise `ncc build` fails...
const paths = { DIST, POSTS, PAGES, STATIC, TEMPLATES: TEMPLATES };

const token = core.getInput('repo-token', { required: true });
const url = core.getInput('url', { required: true });
const title = core.getInput('title');
const description = core.getInput('description');
const theme = core.getInput('theme');
const maxWidth = core.getInput('max-width');
const dateFormat = core.getInput('date-format');
const postsPerPage = core.getInput('posts-per-page');
const { repo } = github.context;
const octokit = github.getOctokit(token);
const userOptions = {
  url,
  ...(title ? { title } : undefined),
  ...(description ? { description } : undefined),
  ...(theme ? { theme } : undefined),
  ...(maxWidth && !Number.isNaN(parseInt(maxWidth, 10))
    ? { maxWidth }
    : undefined),
  ...(dateFormat ? { dateFormat } : undefined),
  ...(postsPerPage ? { postsPerPage } : undefined),
};

run({ paths, octokit, repo, userOptions }).then(
  () => console.log('Successfully built Microblog'),
  (err) => {
    console.log(err.message);
    console.log(err.stack);
  }
);
