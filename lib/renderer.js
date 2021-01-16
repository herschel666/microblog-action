const nunjucks = require('nunjucks');
const format = require('date-fns/format');

exports.createRenderer = (folder) => {
  const renderer = nunjucks.configure(folder);

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
