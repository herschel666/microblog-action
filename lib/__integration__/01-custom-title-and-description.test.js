const path = require('path');
const { getByText } = require('@testing-library/dom');

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

describe('Microblog-Action :: Custom Title & Description', () => {
  const title = 'My Awesome Micöblög!';
  const description = 'Came for the Metal Ümläüts, stayed for the c0ntent';

  console.log('Custom Title & Description', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      title,
      description,
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
  });

  describe('Site', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, 'index.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have custom title & description', () => {
      getByText(container, title);
      getByText(container, description);
    });
  });
});
