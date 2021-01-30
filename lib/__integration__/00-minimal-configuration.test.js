const path = require('path');
const {
  promises: { readFile },
} = require('fs');
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
    path.basename(__filename).replace('.test.js', '-')
  )
);

describe('Microblog-Action :: Minimal Configuration', () => {
  console.log('Minimal Configuration', outDir);

  it('should run successfully', async () => {
    const repo = { owner: 'herschel666', repo: 'ddd' };
    const url = 'http://localhost:8080';
    const userOptions = {
      ...globalVar('TEST.DEFAULTS'),
      url,
      outDir,
    };

    await expect(
      run({ octokit: globalVar('TEST.OCTOKIT'), paths, repo, userOptions })
    ).resolves.toBe(undefined);
  });

  describe('Frontpage', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, 'index.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have a document title', () => {
      const { textContent: title } = document.querySelector('title');

      expect(title).toBe(`herschel666's Microblog`);
    });

    it('should have a main heading', () => {
      getByText(container, `herschel666's Microblog`);
    });

    it('should have ten posts', () => {
      const articles = document.getElementsByTagName('article');

      expect(articles.length).toBe(10);
    });

    it('should have a link to the previous posts', () => {
      const { href } = getByText(container, '« previous');

      expect(href.endsWith('/2.html')).toBe(true);
    });

    it('should not filter issues in any way', () => {
      getByText(container, 'A real issue');
      getByText(container, 'Closed issue');
    });

    it('should have a footer', () => {
      const year = new Date().getFullYear();
      const re = new RegExp(`${year}[\\s\\n]+herschel666`, 'g');
      const footer = document.querySelector('footer.footer');

      expect(footer.textContent).toMatch(re);
    });

    it('should [rel=me]-link in the footer to the Github profile', () => {
      const { href: url } = document.querySelector('a[rel=me]');

      expect(url).toBe('https://github.com/herschel666');
    });

    it('should have the default theme', () => {
      const { href } = document.querySelector('link[rel="stylesheet"]');

      expect(href.endsWith('/new.min.css')).toBe(true);
    });

    it('should have the RSS feed reference', () => {
      const { href } = document.querySelector(
        'link[type="application/rss+xml"]'
      );

      expect(href.endsWith('/feed.xml')).toBe(true);
    });
  });

  describe('Page 2', () => {
    let destroy = () => {
      throw new Error('Site has not been initialized.');
    };
    let container;

    beforeAll(async () => {
      const page = await createPage(outDir, '2.html');
      destroy = page.destroy;
      container = page.container;
    });

    afterAll(() => {
      expect(() => destroy()).not.toThrow();
    });

    it('should have a single post', () => {
      const articles = document.getElementsByTagName('article');

      expect(articles.length).toBe(1);
    });

    it('should have a link to the next posts', () => {
      const { href } = getByText(container, 'next »');

      expect(href.endsWith('/index.html')).toBe(true);
    });
  });

  describe('Post Detail Page', () => {
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

    it('should have a heading', () => {
      getByText(container, 'Test #1');
    });

    it('should have sub-headings', () => {
      const [, { textContent: caption }] = document.querySelectorAll(
        '.article h2'
      );

      expect(caption).toBe('Foo Bar');
    });

    it('should have a code blog', () => {
      const { textContent: code } = document.querySelector('.article code');

      expect(code.trim()).toBe("console.log('w00t');");
    });

    it('should have an unordered list', () => {
      const listItems = document.querySelectorAll('.article ul li');
      const [{ textContent: text }] = listItems;

      expect(listItems.length).toBe(3);
      expect(text).toBe('first item');
    });
  });

  describe('XML Feed', () => {
    let feed;

    beforeAll(async () => {
      const xml = await readFile(path.join(outDir, 'feed.xml'), 'utf8');
      const dp = new DOMParser();
      feed = dp.parseFromString(xml, 'application/xml');
    });

    it('should have a document title', () => {
      const { textContent: title } = feed.querySelector('title');

      expect(title).toBe(`herschel666's Microblog`);
    });

    it('should specify the generator', () => {
      const { textContent: generator } = feed.querySelector('generator');

      expect(generator).toBe('https://github.com/herschel666/microblog-action');
    });

    it('should have post items', () => {
      const items = feed.querySelectorAll('item');
      const [item] = items;
      const { textContent: itemTitle } = item.querySelector('title');
      const { textContent: pubDate } = item.querySelector('pubDate');
      const { textContent: description } = item.querySelector('description');

      expect(items.length).toBe(10);
      expect(itemTitle).toBe('Test #10');
      expect(pubDate).toContain('Sun, 17 Jan 2021');
      expect(
        description
          .trim()
          .startsWith(
            '<p>Velit eiusmod velit mollit dolore anim ullamco anim proident in ullamco fugiat tempor enim qui.'
          )
      ).toBe(true);
    });
  });
});
