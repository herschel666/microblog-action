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

describe('Microblog-Action :: Custom Date Format', () => {
  console.log('Custom Date Format', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      dateFormat: 'HH:mm:ss; yo (QQQ) MMM do',
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
      const page = await createPage(outDir, 'posts/786133283.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have the custom date format', () => {
      getByText(
        container,
        /\d{2}:\d{2}:\d{2};\s\d{4}st\s\(Q\d{1}\)\s\w{3}\s\d{2}(st|nd|th)/
      );
    });
  });
});
