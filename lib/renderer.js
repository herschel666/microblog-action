const nunjucks = require('nunjucks');
const format = require('date-fns/format');

const { createSlug } = require('./util');

exports.createRenderer = (folder, lang) => {
  const renderer = nunjucks.configure(folder);

  renderer.addFilter('date', (dateString, dateFormat) => {
    if (!dateFormat) {
      throw new Error(
        'Template: please provide a format to the "date"-filter.'
      );
    }
    return format(new Date(dateString), dateFormat);
  });

  renderer.addFilter('slug', (str) => createSlug(str, lang));

  return renderer;
};
