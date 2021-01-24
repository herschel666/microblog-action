const path = require('path');
const { promises: fs } = require('fs');

exports.globalVar = (key) => {
  if (!(key in global)) {
    throw new Error(`Global variable ${key} does not exist`);
  }
  return global[key];
};

exports.createPage = async (outDir, filename) => {
  const content = await fs.readFile(path.join(outDir, filename), 'utf8');
  const [, body] = content.split(/<\/?body[^>]*>/);
  const [, head] = content.split(/<\/?head[^>]*>/);
  const destroy = () => Object.assign(document.body, { innerHTML: '' });
  Object.assign(document.body, { innerHTML: body });
  Object.assign(document.head, { innerHTML: head });
  return { container: document.body, destroy };
};
