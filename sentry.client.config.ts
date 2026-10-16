import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Scrub sensitive headers & PII
      if (event.request?.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["Cookie"];
        delete event.request.headers["x-turnstile-token"];
      }
      if (event.user) {
        delete event.user.ip_address;
        delete event.user.email;
        delete (event.user as Record<string, unknown>).phone;
      }
      return event;
    },
  });
}
