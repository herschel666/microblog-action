const path = require('path');
const { promises: fs } = require('fs');
const cpy = require('cpy');

exports.getThemeLink = (theme) => {
  switch (theme) {
    case 'water.css':
      return 'https://cdn.jsdelivr.net/npm/water.css@2/out/water.css';
    case 'mvp.css':
      return 'https://unpkg.com/mvp.css';
    case 'awsm.css':
      return 'https://unpkg.com/awsm.css/dist/awsm.min.css';
    case 'bahunya':
      return 'https://cdn.rawgit.com/kimeiga/bahunya/css/bahunya-0.1.3.css';
    case 'sakura.css':
      return 'https://unpkg.com/sakura.css/css/sakura.css';
    case 'style.css':
      return 'https://unpkg.com/style.css/style.css';
    case 'tufte-css':
      return 'https://unpkg.com/tufte-css/tufte.min.css';
    case 'tacit':
      return 'https://cdn.jsdelivr.net/gh/yegor256/tacit@gh-pages/tacit-css-1.5.3.min.css';
    case 'new.css':
      return 'https://cdn.jsdelivr.net/npm/@exampledev/new.css@1/new.min.css';
    case 'bullframe.css':
      return 'https://cdn.jsdelivr.net/npm/bullframe.css/dist/css/bullframe-classless.min.css';
    default:
      throw new Error(`Unknown theme "${theme}".`);
  }
};

exports.normalizeSiteUrl = (url) => {
  const { origin, pathname } = new URL(url);
  const basePath = `${pathname}${pathname.endsWith('/') ? '' : '/'}`;
  return { url: origin, basePath };
};

exports.copyStatic = async (fromDir, toDir) => {
  await cpy(path.join(fromDir, '**/*'), toDir);
};

exports.loadCustomStyles = async (file) => {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (e) {
    return null;
  }
};
