const path = require('path');
const { promises: fs } = require('fs');

const { createRenderer } = require('./renderer');
const { renderMarkdown } = require('./markdown');
const { getPages, getPosts } = require('./data');
const { getThemeLink, normalizeSiteUrl, copyStatic } = require('./util');

exports.run = async ({ paths, octokit, repo, userOptions }) => {
  const { DIST, POSTS, PAGES, STATIC, TEMPLATES } = paths;
  const defaultOptions = {
    title: `${repo.owner}'s Microblog`,
    maxWidth: 640,
    dateFormat: 'd.M.yyyy H:mm',
    basePath: '/',
    postPerPage: '10',
  };
  const options = Object.assign(defaultOptions, userOptions);
  const renderer = createRenderer(TEMPLATES);
  const themeLink =
    typeof options.theme === 'undefined' ? null : getThemeLink(options.theme);
  const postsPerPage = Number(options.postsPerPage);
  const { url, basePath } = normalizeSiteUrl(options.url);

  await fs.rmdir(DIST, { recursive: true });
  await fs.mkdir(POSTS, { recursive: true });
  await copyStatic(STATIC, DIST);

  const data = [
    getPosts({
      repo: repo,
      octokit,
    }),
    getPages(path.join(PAGES, '/*.{md,markdown}')),
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
    themeLink,
    url,
    basePath,
    title: options.title,
    description: options.description,
    maxWidth: options.maxWidth,
    dateFormat: options.dateFormat,
    time: new Date(),
    pages: pageContents,
    posts: postContents,
  };
  const postFiles = postContents.map((post) =>
    renderer.render('post.html', { post, site })
  );
  const pageFiles = pageContents.map((page) =>
    renderer.render('page.html', { page, site })
  );
  const paginatedPosts = postContents.reduce((acc, post) => {
    const last = acc[acc.length - 1];
    if (!Array.isArray(last) || last.length === postsPerPage) {
      acc.push([post]);
    } else {
      last.push(post);
    }
    return acc;
  }, []);
  const indexes = paginatedPosts.map((posts, i, { length: max }) => {
    const base = i + 1;
    const prev = base < max ? base + 1 : undefined;
    const next = base > 2 ? base - 1 : base > 1 ? 'index' : undefined;
    const hasNext = typeof next === 'number' || next === 'index';
    const hasPrev = typeof prev === 'number';

    return renderer.render('index.html', {
      site,
      next,
      prev,
      hasNext,
      hasPrev,
      posts,
    });
  });
  const rssFeed = renderer.render('feed.xml', {
    site,
    posts: postContents.slice(0, postsPerPage),
  });
  const writePosts = postFiles.map((file, i) =>
    fs.writeFile(path.join(POSTS, `${postContents[i].id}.html`), file, 'utf8')
  );
  const writePages = pageFiles.map((file, i) =>
    fs.writeFile(path.join(DIST, `${pageContents[i].id}.html`), file, 'utf8')
  );
  const writeIndexes = indexes.map((index, i) =>
    fs.writeFile(
      path.join(DIST, `${i === 0 ? 'index' : ++i}.html`),
      index,
      'utf8'
    )
  );
  const writeRssFeed = fs.writeFile(
    path.join(DIST, 'feed.xml'),
    rssFeed,
    'utf8'
  );

  await Promise.all([
    ...writePosts,
    ...writePages,
    ...writeIndexes,
    writeRssFeed,
  ]);
};
