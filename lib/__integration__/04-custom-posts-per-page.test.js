const path = require('path');
const { getByText, queryByText } = require('@testing-library/dom');

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

describe('Microblog-Action :: Custom Posts per Page', () => {
  console.log('Custom Posts per Page', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      postsPerPage: 2,
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

    it('should have two posts on the front page', () => {
      const { length } = document.querySelectorAll('article h3');

      expect(length).toBe(2);
    });
  });

  describe('Last page', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, '6.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should be the last page', () => {
      getByText(container, 'next »');
      expect(queryByText(container, '« previous')).toBeNull();
    });

    it('should have one post on the last page', () => {
      const { length } = document.querySelectorAll('article h3');

      expect(length).toBe(1);
    });
  });
});
