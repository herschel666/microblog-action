const path = require('path');

const { globalVar, createPage } = require('./helpers/util');
const { run } = require('..');

const CWD = path.resolve(__dirname, '..', '..');
const TEMPLATES = path.resolve(CWD, 'templates');
const paths = { CWD, TEMPLATES };
const outDir = path.relative(
  CWD,
  path.join(
    globalVar('TEST.TMP_DIR'),
    path.basename(__filename).replace('.test.js', '')
  )
);

describe('Microblog-Action :: Custom Theme', () => {
  console.log('Custom Theme', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      theme: 'bahunya',
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
  });

  describe('Site', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };

    beforeAll(async () => {
      const page = await createPage(outDir, 'index.html');
      destroy = page.destroy;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have the selected theme', () => {
      const { href } = document.querySelector('link[rel="stylesheet"');

      expect(href.endsWith('/bahunya-0.1.3.css')).toBe(true);
    });
  });
});
