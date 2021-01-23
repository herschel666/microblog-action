const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { execSync } = require('child_process');

const { run } = require('./lib/');

const CWD = execSync('pwd').toString('utf8').trim();
const TEMPLATES = path.join(__dirname, 'templates');
// No shorthand for TEMPLATES, because otherwise `ncc build` fails...
const paths = { CWD, TEMPLATES: TEMPLATES };

const token = core.getInput('repo-token', { required: true });
const url = core.getInput('url', { required: true });
const title = core.getInput('title');
const description = core.getInput('description');
const theme = core.getInput('theme');
const dateFormat = core.getInput('date-format');
const postsPerPage = core.getInput('posts-per-page');
const customStyles = core.getInput('custom-styles');
const pages = core.getInput('pages');
const staticFrontpage = core.getInput('static-frontpage');
const label = core.getInput('label');
const closed = core.getInput('closed');
const outDir = core.getInput('out-dir');
const lang = core.getInput('lang');
const i18nNext = core.getInput('i18n.next');
const i18nPrev = core.getInput('i18n.prev');
const i18nPosts = core.getInput('i18n.posts');
const i18n = {
  next: i18nNext,
  prev: i18nPrev,
  posts: i18nPosts,
};
const { repo } = github.context;
const octokit = github.getOctokit(token);
const userOptions = {
  url,
  lang,
  i18n,
  theme,
  dateFormat,
  postsPerPage,
  pages,
  outDir,
  ...(title ? { title } : undefined),
  ...(description ? { description } : undefined),
  ...(customStyles
    ? { customStyles: path.resolve(CWD, customStyles) }
    : undefined),
  ...(staticFrontpage ? { staticFrontpage } : undefined),
  ...(label ? { label } : undefined),
  ...(closed ? { closed } : undefined),
};

run({ paths, octokit, repo, userOptions }).then(
  () => console.log('Successfully built Microblog'),
  (err) => {
    console.log(err.message);
    console.log(err.stack);
  }
);
