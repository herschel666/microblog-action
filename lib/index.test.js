const { Octokit } = require('@octokit/rest');

const { run } = require('.');

const token = process.env.GITHUB_ACCESS_TOKEN;

if (!token) {
  throw new Error('Please set GITHUB_ACCESS_TOKEN for the test.');
}

describe('Microblog-Action', () => {
  it('should run successfully', async () => {
    const octokit = new Octokit({
      auth: token,
      userAgent: 'herschel666/microblog-action integration test',
    });
    const repo = { owner: 'herschel666', repo: 'ddd' };

    await expect(run({ octokit, repo })).resolves.toBe(void 0);
  });
});
