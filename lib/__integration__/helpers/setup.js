const { join } = require('path');
const {
  existsSync: exists,
  mkdirSync: mkdir,
  mkdtempSync: mkdtemp,
  readFileSync: readFile,
} = require('fs');
const { load: parseYaml } = require('js-yaml');
const { Octokit } = require('@octokit/rest');

const ROOT = join(__dirname, '..', '..', '..');
const TMP = join(ROOT, '.tmp');

const token = process.env.GH_ACCESS_TOKEN;

if (!token) {
  throw new Error('Please set GH_ACCESS_TOKEN for the test.');
}

if (!exists(TMP)) {
  mkdir(TMP);
}

const configFile = join(ROOT, 'action.yml');

const camelCasify = (s) => s.replace(/(-\w)/g, ([, c]) => c.toUpperCase());

const getPartialObject = (acc, key, value) => {
  if (key.includes('.')) {
    const [maybeKebabOuterKey, innerKey] = key.split('.');
    const outerKey = camelCasify(maybeKebabOuterKey);
    acc[outerKey] = acc[outerKey] || {};
    return {
      [outerKey]: {
        ...acc[outerKey],
        ...getPartialObject(acc[outerKey], innerKey, value),
      },
    };
  }
  return { [camelCasify(key)]: value };
};

const actionYmlText = readFile(configFile, 'utf8');
const tmpDir = mkdtemp(join(TMP, 'integration-test-'));
const { inputs: options } = parseYaml(actionYmlText);

global['TEST.OCTOKIT'] = new Octokit({
  auth: token,
  userAgent: 'herschel666/microblog-action integration test',
});
global['TEST.TMP_DIR'] = tmpDir;
global['TEST.DEFAULTS'] = Object.entries(options)
  .filter(([, { default: defaultValue }]) => Boolean(defaultValue))
  .reduce(
    (acc, [key, { default: value }]) => ({
      ...acc,
      ...getPartialObject(acc, key, value),
    }),
    {}
  );
