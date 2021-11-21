const globby = require('globby');
const { join } = require('path');
const {
  promises: { rm },
} = require('fs');

const ROOT = join(__dirname, '..', '..', '..');

module.exports = async () => {
  if (process.env.KEEP_SITES) {
    return;
  }

  const dirs = await globby(join(ROOT, '.tmp', 'integration-test-*'), {
    onlyDirectories: true,
  });
  await Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true })));
};
