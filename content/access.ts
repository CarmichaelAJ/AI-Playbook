// Who may see a piece of content.
//
// Everything in this repository is shipped to browsers as static files (HTML, JavaScript,
// the client search index, and fixtures), so it is public by definition. The type has one
// member on purpose: the compiler refuses any other value, which stops someone from
// marking an item "restricted" and assuming that hides it. It would not; a static export
// cannot enforce access.
//
// Restricted content needs an approved access policy and an authenticated backend that
// checks the user's authorization before it returns a single byte. Until those exist,
// do not add any other value here. See docs/RESTRICTED_CONTENT_REQUIREMENTS.md.
export type ContentAccess = "public";
