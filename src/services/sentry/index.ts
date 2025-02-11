import config from 'src/utils/config';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  enabled: !config.isDevMode(),
  dsn: config.SENTRY_DNS,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  // profilesSampleRate is relative to tracesSampleRate.
  // Here, we'll capture profiles for 100% of transactions.
  profilesSampleRate: 1.0,
});

export const SentryWrapper = App => {
  if (Sentry) return Sentry.wrap(App);
  else return App;
};
