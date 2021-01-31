exports.readVersion = (content) => {
  const [, version] = content.match(
    /herschel666\/microblog-action@v(\d{0,2}\.\d{0,2})\n/
  );
  return version;
};

exports.writeVersion = (content, version) => {
  const [major, minor] = version.split('.');
  const newContent = content.replace(
    /(herschel666\/microblog-action@v)\d{0,2}\.\d{0,2}(\n)/g,
    `$1${major}.${minor}$2`
  );
  return newContent;
};
