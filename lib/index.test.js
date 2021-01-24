const path = require('path');
const { Octokit } = require('@octokit/rest');

const { run } = require('.');

const CWD = path.resolve(__dirname, '..');
const TEMPLATES = path.resolve(CWD, 'templates');
const paths = { CWD, TEMPLATES };

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
    const i18n = {
      next: 'next',
      prev: 'prev',
      posts: 'Articles',
    };
    const userOptions = {
      description,
      url,
      i18n,
      customStyles,
      lang: 'en',
      theme: 'new.css',
      dateFormat: 'd.M.yyyy H:mm',
      postsPerPage: 2,
      pages: [
        'pages/*.md',
        'lib/__integration__/fixtures/pages/**/*.md',
        'README.md',
        'lib/**/*.css',
      ],
      staticFrontpage: 'about.md',
      label: 'blog',
      outDir: '_site',
    };

    await expect(run({ paths, octokit, repo, userOptions })).resolves.toBe(
      undefined
    );
  });
});
