const path = require('path');
const { getByText } = require('@testing-library/dom');

const { globalVar, createPage } = require('./helpers/util');
const { run } = require('..');

jest.mock('../logger');

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

describe('Microblog-Action :: Static Frontpage', () => {
  console.log('Static Frontpage', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const pages = path.relative(CWD, path.join(__dirname, 'fixtures', 'pages'));
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      staticFrontpage: 'about.md',
      url,
      outDir,
      pages,
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
  });

  describe('Frontpage', () => {
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

    it('should have a heading', () => {
      getByText(container, 'About this site', { selector: 'h2' });
    });

    it('should have content', () => {
      getByText(container, 'pariatur laborum amet enim velit eiusmod.');
    });
  });
});
