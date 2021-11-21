const path = require('path');
const { promises: fs } = require('fs');

const { createRenderer } = require('./renderer');
const { renderMarkdown } = require('./markdown');
const { getPages, getPosts } = require('./data');
const {
  getThemeLink,
  normalizeSiteUrl,
  copyStatic,
  loadOptionalFile,
  createSlug,
} = require('./util');

exports.run = async ({ paths, octokit, repo, userOptions }) => {
  const defaultOptions = {
    title: `${repo.owner}'s Microblog`,
  };
  const options = Object.assign(defaultOptions, userOptions);

  const { CWD, TEMPLATES } = paths;
  const DIST = path.join(CWD, options.outDir);
  const POSTS = path.join(DIST, 'posts');
  const STATIC = path.join(CWD, options.staticDir);

  const renderer = createRenderer(TEMPLATES, options.lang);
  const themeLink = getThemeLink(options.theme);
  const postsPerPage = Number(options.postsPerPage);
  const { url, basePath } = normalizeSiteUrl(options.url);
  const [baseStyles, customStyles, customJavascript] = await Promise.all([
    fs.readFile(path.join(__dirname, 'styles.css'), 'utf8'),
    loadOptionalFile(options.customStyles),
    loadOptionalFile(options.customJavascript),
  ]);

  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(POSTS, { recursive: true });
  await copyStatic(STATIC, DIST);

  const data = [
    getPosts({
      repo: repo,
      label: options.label,
      closed: options.closed,
      octokit,
    }),
    getPages(CWD, options.pages),
  ];
  const [posts, pages] = await Promise.all(data);
  const hasStaticFrontpage =
    options.staticFrontpage &&
    pages.findIndex(({ filename }) => filename === options.staticFrontpage) >
      -1;
  const postsIndexName = hasStaticFrontpage
    ? createSlug(options.i18n.posts, options.lang)
    : 'index';
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
    baseStyles,
    customStyles,
    customJavascript,
    hasStaticFrontpage,
    theme: options.theme.replace(/\./g, '-'),
    lang: options.lang,
    title: options.title,
    description: options.description,
    dateFormat: options.dateFormat,
    i18n: options.i18n,
    time: new Date(),
    pages: pageContents.filter(
      ({ filename }) => filename !== options.staticFrontpage
    ),
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
    const next = base > 2 ? base - 1 : base > 1 ? postsIndexName : undefined;
    const hasNext = typeof next === 'number' || next === postsIndexName;
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
  const writePages = pageFiles.map((file, i) => {
    const filename =
      pageContents[i].filename === options.staticFrontpage
        ? 'index'
        : pageContents[i].id;
    return fs.writeFile(path.join(DIST, `${filename}.html`), file, 'utf8');
  });
  const writeIndexes = indexes.map((index, i) =>
    fs.writeFile(
      path.join(DIST, `${i === 0 ? postsIndexName : ++i}.html`),
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
