const path = require('path');
const { promises: fs } = require('fs');
const globby = require('globby');

const filterWip = ({ labels }) =>
  labels.some(({ name }) => name.toLowerCase() === 'wip') === false;

exports.getPages = async (directory) => {
  const files = await globby(directory);
  const data = await Promise.all(files.map((f) => fs.readFile(f, 'utf8')));

  return data.map((body, i) => ({ body, filename: path.basename(files[i]) }));
};

exports.getPosts = async ({ octokit, repo, perPage }) => {
  const { data } = await octokit.issues.listForRepo({
    ...repo,
    creator: repo.owner,
    per_page: Number(perPage ? perPage : '10'),
  });

  return data
    .filter(filterWip)
    .map(({ id, number, title, body, created_at: createdAt }) => ({
      filename: `${id}.issue`,
      number,
      title,
      body,
      createdAt,
    }));
};
