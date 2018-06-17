module.exports = function override(config, env) {
  config.module.rules.push({
    test: /locales/,
    loader: '@alienfast/i18next-loader',
    // options here
    query: { basenameAsNamespace: true },
  });
  return config;
};
