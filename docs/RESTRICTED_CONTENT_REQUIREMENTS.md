# Restricted content requirements

**Status: not implemented. Do not add restricted content to this repository.**

Everything in this application is public. It is exported as static files (HTML,
JavaScript, a client-side search index, fixtures) and served by Nginx or Vercel. A
static export cannot enforce who may see what: anything in those files is visible to
anyone who can fetch them. Hiding it with a client-side filter, a CSS class, a feature
flag, or a "locked" label is **not** access control.

This application is **not approved to process, store, or display any classification
level**, and nothing here should be read as a claim otherwise. The simulated Entra
sign-in and the API's `mock-mil` adapter trust values typed by the user or sent in a
request header. They are development tools and must never gate real content.

## What the code does today

- [content/access.ts](../content/access.ts) allows only `"public"`. The compiler rejects any other
  value, so no one can mark an item restricted and assume it is protected.
- Communities and play adaptations carry `access: "public"`.
- No restricted content, labels, clearance rules, or identity claims exist in the repo.

## What must exist before any restricted content is added

None of these were supplied, and none may be invented.

1. **An approved access policy.** The exact labels, who may see each, and what identity
   claims prove it. Owner: the program's security authority.
2. **An approved environment.** Hosting, accreditation, and data-handling requirements for each level.
3. **A real identity provider.** For example the Entra integration in
   [ENTRA_CUTOVER.md](ENTRA_CUTOVER.md), with the required claims verified server-side.
   Remove the simulated sign-in and mock adapter from that environment.
4. **An authenticated backend that authorizes every request.**
   - Check the user's authorization on the server before returning any restricted byte.
   - Return restricted items only in API responses, never at build time.
   - Search restricted content server-side, and filter results by authorization before they are
     ranked, counted, or paginated. Do not build restricted entries into the client search index.
   - Use identifiers that reveal nothing (no restricted titles in URLs or error messages).
   - Respond to unauthorized requests exactly as for content that does not exist.
5. **No leakage paths.** Keep restricted text out of static HTML, JS bundles, source maps, fixtures,
   the service worker cache, analytics events, error reports, and logs. Review `public/sw.js`
   (it caches pages) and `trackAnalyticsEvent` before adding anything.
6. **Tests.** Automated checks that an unauthenticated and an unauthorized request receive nothing,
   and that a built `out/` directory contains no restricted strings.

## Where the extension point is

Add restricted content as data fetched from the backend (see [lib/platformApi.ts](../lib/platformApi.ts))
and rendered inside the existing community page. Do not add it to
[content/communities.ts](../content/communities.ts), [content/playCommunities.ts](../content/playCommunities.ts), or
[content/plays/](../content/plays), which ship to every browser.
