const path = require('path');
const nunjucks = require('nunjucks');
const format = require('date-fns/format');

const DEFAULT_FOLDER = path.resolve(__dirname, '..', 'templates');

exports.createRenderer = (folder = DEFAULT_FOLDER) => {
  const renderer = nunjucks.configure(folder, {
    autoescape: false,
  });

  renderer.addFilter('date', (dateString, dateFormat) => {
    if (!dateFormat) {
      throw new Error(
        'Template: please provide a format to the "date"-filter.'
      );
    }
    return format(new Date(dateString), dateFormat);
  });

  return renderer;
};
