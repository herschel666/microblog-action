const path = require('path');
const { Octokit } = require('@octokit/rest');

const { run } = require('.');

const CWD = path.resolve(__dirname, '..');
const DIST = path.join(CWD, '_site');
const POSTS = path.join(DIST, 'posts');
const PAGES = path.resolve(CWD, 'pages');
const TEMPLATES = path.resolve(CWD, 'templates');
const paths = { DIST, POSTS, PAGES, TEMPLATES };

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
    const description = 'Testing all the things!';
    const userOptions = { description, theme: 'tacit', postsPerPage: 2 };

    await expect(run({ paths, octokit, repo, userOptions })).resolves.toBe(
      undefined
    );
  });
});
