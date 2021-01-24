const path = require('path');
const {
  promises: { readFile },
} = require('fs');

const { globalVar } = require('./helpers/util');
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

describe('Microblog-Action :: Static files', () => {
  console.log('Static files', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const staticDir = path.relative(
      CWD,
      path.join(__dirname, 'fixtures', 'static')
    );
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
      staticDir,
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
  });

  describe('Frontpage', () => {
    let robotsTxt;
    let misc;

    beforeAll(async () => {
      const files = await Promise.all([
        readFile(path.join(outDir, 'robots.txt'), 'utf8'),
        readFile(path.join(outDir, 'text.txt'), 'utf8'),
      ]);
      robotsTxt = files[0];
      misc = files[1];
    });

    it('should have a robots.txt', () => {
      expect(robotsTxt.trim()).toBe('Allow: *');
    });

    it('should the text.txt file', () => {
      expect(misc.trim()).toBe('Hello World.');
    });
  });
});
