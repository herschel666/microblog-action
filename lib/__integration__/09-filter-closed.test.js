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

describe('Microblog-Action :: Filter Closed', () => {
  console.log('Filter Closed', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const closed = true;
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      closed,
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
  });

  describe('Frontpage', () => {
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

    it('should only have a single post', () => {
      const {
        length,
        [0]: { textContent: heading },
      } = document.querySelectorAll('article h3');

      expect(length).toBe(1);
      expect(heading.trim()).toBe('Closed issue');
    });
  });
});
