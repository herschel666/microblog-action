const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

const { run } = require('./lib/');

const CWD = execSync('pwd').toString('utf8').trim();
const DIST = path.join(CWD, '_site');
const POSTS = path.join(DIST, 'posts');
const PAGES = path.join(CWD, 'pages');
const TEMPLATES = path.join(__dirname, 'templates');
// No shorthand for TEMPLATES, because otherwise `ncc build` fails...
const paths = { DIST, POSTS, PAGES, TEMPLATES: TEMPLATES };

const token = core.getInput('repo-token', { required: true });
const title = core.getInput('title');
const theme = core.getInput('theme');
const maxWidth = core.getInput('max-width');
const dateFormat = core.getInput('date-format');
const basePath = core.getInput('base-path');
const postsPerPage = core.getInput('posts-per-page');
const { repo } = github.context;
const octokit = github.getOctokit(token);
const userOptions = {
  ...(title ? { title } : undefined),
  ...(theme ? { theme } : undefined),
  ...(maxWidth && !Number.isNaN(parseInt(maxWidth, 10))
    ? { maxWidth }
    : undefined),
  ...(dateFormat ? { dateFormat } : undefined),
  ...(basePath ? { basePath } : undefined),
  ...(postsPerPage ? { postsPerPage } : undefined),
};

run({ paths, octokit, repo, userOptions }).then(
  () => console.log('Successfully built Microblog'),
  (err) => {
    console.log(err.message);
    console.log(err.stack);
  }
);
