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

describe('Microblog-Action :: i18n', () => {
  console.log('i18n', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const pages = path.relative(CWD, path.join(__dirname, 'fixtures', 'pages'));
    const i18n = {
      prev: 'previous posts',
      next: 'next posts',
      posts: 'The awesome posts',
    };
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      staticFrontpage: 'about.md',
      url,
      outDir,
      pages,
      i18n,
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

    it('should have the posts page in the main nav', () => {
      const { href } = getByText(container, 'The awesome posts');

      expect(href.endsWith('/the-awesome-posts.html')).toBe(true);
    });
  });

  describe('Posts page', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, 'the-awesome-posts.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have the posts page in the main nav', () => {
      getByText(container, '« previous posts');
    });
  });

  describe('Posts page two', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, '2.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have the posts page in the main nav', () => {
      getByText(container, 'next posts »');
    });
  });
});
