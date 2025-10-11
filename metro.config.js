const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const { withSentryConfig } = require('@sentry/react-native/metro');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    resolveRequest: (context, moduleName, platform) => {
      // Redirect both sodium-native and sodium-universal to sodium-javascript for React Native
      // sodium-universal uses the browser field which Metro doesn't respect by default
      if (moduleName === 'sodium-native' || moduleName === 'sodium-universal') {
        return {
          filePath: require.resolve('sodium-javascript'),
          type: 'sourceFile',
        };
      }

      // Use default resolver for everything else
      return context.resolveRequest(context, moduleName, platform);
    },

  },
};

module.exports = withSentryConfig(mergeConfig(defaultConfig, config));
