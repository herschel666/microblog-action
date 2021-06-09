const path = require('path');
const { promises: fs } = require('fs');
const globby = require('globby');

const { warn } = require('./logger');

const MARKDOWN_SUFFIXES = ['.md', '.markdown'];

const filterInvalidFiles = (file) => {
  if (MARKDOWN_SUFFIXES.includes(path.extname(file))) {
    return true;
  }
  warn('Skipping file %s, because it is not a valid markdown file.', file);
  return false;
};

const filterPullRequests = ({ pull_request: pr }) => pr === undefined;

const filterWip = ({ labels }) =>
  labels.some(({ name }) => name.toLowerCase() === 'wip') === false;

exports.getPages = async (cwd, glob) => {
  const files = await globby(glob, { gitignore: true, cwd });
  const validFiles = files.filter((file) => filterInvalidFiles(file));
  const data = await Promise.all(validFiles.map((f) => fs.readFile(f, 'utf8')));

  return data.reduce((acc, body, i) => {
    const filename = path.basename(validFiles[i]).toLocaleLowerCase();
    const isUnique = acc.findIndex(({ filename: f }) => f === filename) === -1;

    if (isUnique) {
      acc.push({ body, filename });
    } else {
      warn(
        'Duplicate page %s found; only the first occurrence will be rendered.',
        validFiles[i]
      );
    }

    return acc;
  }, []);
};

exports.getPosts = async ({ octokit, repo, label, closed }) => {
  const result = await octokit.paginate(octokit.rest.issues.listForRepo, {
    ...repo,
    ...(label ? { labels: label } : undefined),
    ...(closed ? { state: 'closed' } : undefined),
    creator: repo.owner,
  });

  return result
    .filter(filterPullRequests)
    .filter(filterWip)
    .map(({ id, number, title, body, created_at: createdAt }) => ({
      filename: `${id}.issue`,
      number,
      title,
      body,
      createdAt,
    }));
};
