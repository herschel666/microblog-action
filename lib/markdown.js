const remark = require('remark');
const html = require('remark-html');
const fm = require('remark-frontmatter');
const gfm = require('remark-gfm');
const yaml = require('js-yaml');

exports.renderMarkdown = async (item) => {
  const { title, number, createdAt, ...intermediaryItem } = item;
  const meta = { title, number, createdAt };
  const storeMeta = () => ({ children }) => {
    const { value: frontmatter } =
      children.find(({ type }) => type === 'yaml') || {};
    if (frontmatter) {
      Object.assign(meta, yaml.load(frontmatter));
    }
  };
  const parser = remark().use(fm).use(storeMeta).use(html).use(gfm);
  const file = await parser.process(intermediaryItem.body);
  const [, ...id] = intermediaryItem.filename.split('.').reverse();

  return {
    ...intermediaryItem,
    meta,
    id: id.join('-'),
    body: file.toString('utf8'),
  };
};
