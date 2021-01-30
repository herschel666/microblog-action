const nunjucks = require('nunjucks');
const format = require('date-fns/format');

const { createSlug } = require('./util');

const html = String.raw;

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

  renderer.addFilter('debug', (str) => {
    const value = typeof str === 'object' ? JSON.stringify(str, null, 2) : str;

    return new nunjucks.runtime.SafeString(
      renderer.renderString(html`<pre><code>{{value}}</code></pre>`, { value })
    );
  });

  return renderer;
};
