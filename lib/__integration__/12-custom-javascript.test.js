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

describe('Microblog-Action :: Custom Javascript', () => {
  console.log('Custom Styles', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const customJavascript = path.relative(
      CWD,
      path.join(__dirname, 'fixtures', 'custom.js')
    );
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      customJavascript,
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

    it('should have the custom javascript', () => {
      const { textContent: script } = document.querySelector('script');

      expect(script.trim()).toBe(`console.log('Custom JS');`);
    });
  });
});
