const path = require('path');
const { getByText, queryByText } = require('@testing-library/dom');

const { warn } = require('../logger');
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

describe('Microblog-Action :: Static Pages', () => {
  console.log('Static Pages', outDir);

  it('should run successfully with a warning', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const pages = path.relative(CWD, path.join(__dirname, 'fixtures', 'pages'));
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      pages,
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
    expect(warn).toHaveBeenCalledWith(
      'Duplicate page %s found; only the first occurrence will be rendered.',
      expect.stringMatching(/^[/_a-z]+\/deeply\/about.md$/)
    );
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

    it('should have a main navigation', () => {
      const nav = document.querySelector('header .nav');

      expect(nav).not.toBeNull();
    });

    it.each([
      ['About this site', '/about.html'],
      ['Imprint', '/imprint.html'],
      ['Deeply nested page', '/info.html'],
    ])('should have page %s', (caption, file) => {
      const { href } = getByText(container, caption);

      expect(href.endsWith(file)).toBe(true);
    });

    it('should not have the Not found page in the main nav', () => {
      const anchor = queryByText(container, 'Not found', {
        selector: 'a',
      });

      expect(anchor).toBeNull();
    });
  });

  describe('About page', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, 'about.html');
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

  describe('Not found page', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, '404.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have the correct content', () => {
      getByText(container, 'Nothing found here ;-(');
    });
  });
});
