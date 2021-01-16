const path = require('path');
const { promises: fs } = require('fs');

const { createRenderer } = require('./renderer');
const { renderMarkdown } = require('./markdown');
const { getPages, getPosts } = require('./data');

const DIST = path.join(__dirname, '..', '_site');
const POSTS = path.join(DIST, 'posts');

const renderer = createRenderer();

exports.run = async ({ octokit, repo, postsPerPage }) => {
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(POSTS, { recursive: true });

  const data = [
    getPosts({
      repo: repo,
      perPage: postsPerPage,
      octokit,
    }),
    getPages(),
  ];
  const [posts, pages] = await Promise.all(data);
  const postContents = await Promise.all(
    posts.map((post) => renderMarkdown(post))
  );
  const pageContents = await Promise.all(
    pages.map((page) => renderMarkdown(page))
  );
  const site = {
    ...repo,
    title: 'A Microblog',
    year: new Date().getFullYear(),
    pages: pageContents,
    posts: postContents,
  };
  const postFiles = postContents.map((post) =>
    renderer.render('post.html', { post, site })
  );
  const pageFiles = pageContents.map((page) =>
    renderer.render('page.html', { page, site })
  );
  const frontpage = renderer.render('frontpage.html', {
    site,
    posts: postContents,
  });
  const writePosts = postFiles.map((file, i) =>
    fs.writeFile(path.join(POSTS, `${postContents[i].id}.html`), file, 'utf8')
  );
  const writePages = pageFiles.map((file, i) =>
    fs.writeFile(path.join(DIST, `${pageContents[i].id}.html`), file, 'utf8')
  );
  const writeFrontpage = fs.writeFile(
    path.join(DIST, 'index.html'),
    frontpage,
    'utf8'
  );

  await Promise.all([...writePosts, ...writePages, writeFrontpage]);
};
