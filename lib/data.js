const path = require('path');
const { promises: fs } = require('fs');
const globby = require('globby');

const filterWip = ({ labels }) =>
  labels.some(({ name }) => name.toLowerCase() === 'wip') === false;

exports.getPages = async (glob) => {
  const files = await globby(glob);
  const data = await Promise.all(files.map((f) => fs.readFile(f, 'utf8')));

  return data.map((body, i) => ({ body, filename: path.basename(files[i]) }));
};

exports.getPosts = async ({ octokit, repo, label, closed }) => {
  const result = await octokit.paginate(octokit.issues.listForRepo, {
    ...repo,
    ...(label ? { labels: label } : undefined),
    ...(closed ? { state: 'closed' } : undefined),
    creator: repo.owner,
  });

  return result
    .filter(filterWip)
    .map(({ id, number, title, body, created_at: createdAt }) => ({
      filename: `${id}.issue`,
      number,
      title,
      body,
      createdAt,
    }));
};
