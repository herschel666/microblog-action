const path = require('path');
const { Octokit } = require('@octokit/rest');

const { run } = require('.');

const CWD = path.resolve(__dirname, '..');
const DIST = path.join(CWD, '_site');
const POSTS = path.join(DIST, 'posts');
const PAGES = path.resolve(CWD, 'pages');
const STATIC = path.resolve(CWD, 'static');
const TEMPLATES = path.resolve(CWD, 'templates');
const paths = { DIST, POSTS, PAGES, STATIC, TEMPLATES };

const token = process.env.GH_ACCESS_TOKEN;

if (!token) {
  throw new Error('Please set GH_ACCESS_TOKEN for the test.');
}

describe('Microblog-Action', () => {
  it('should run successfully', async () => {
    const octokit = new Octokit({
      auth: token,
      userAgent: 'herschel666/microblog-action integration test',
    });
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const description = 'Testing all the things!';
    const customStyles = path.resolve(CWD, 'custom.css');
    const userOptions = {
      description,
      url,
      customStyles,
      theme: 'tacit',
      postsPerPage: 2,
      staticFrontpage: 'about.md',
    };

    await expect(run({ paths, octokit, repo, userOptions })).resolves.toBe(
      undefined
    );
  });
});
