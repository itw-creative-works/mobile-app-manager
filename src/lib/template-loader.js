// Webpack loader for template replacement
module.exports = function (source) {
  const replacements = this.query || {};

  let output = source;

  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    output = output.replace(regex, replacements[key]);
  });

  return output;
};
