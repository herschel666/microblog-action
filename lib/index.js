const path = require('path');
const { promises: fs } = require('fs');

const { createRenderer } = require('./renderer');
const { renderMarkdown } = require('./markdown');
const { getPages, getPosts } = require('./data');

exports.run = async ({ paths, octokit, repo, userOptions }) => {
  const { DIST, POSTS, PAGES, TEMPLATES } = paths;
  const renderer = createRenderer(TEMPLATES);
  const defaultOptions = {
    title: `${repo.owner}'s Microblog`,
    basePath: '/',
    postPerPage: '10',
  };

  const options = Object.assign(defaultOptions, userOptions);

  await fs.rmdir(DIST, { recursive: true });
  await fs.mkdir(POSTS, { recursive: true });

  const data = [
    getPosts({
      repo: repo,
      perPage: options.postsPerPage,
      octokit,
    }),
    getPages(PAGES),
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
    title: options.title,
    basePath: options.basePath,
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
