# Microsoft Entra Cutover

The API authentication boundary already supports `disabled`, `mock-mil`, and
`entra` providers. Keep `mock-mil` for local development only. Production must
use `entra`.

## Tenant prerequisites

Create two Entra app registrations:

1. **Airman's AI Playbook Web**
   - Single-page application platform
   - Production and approved local redirect URIs
   - Authorization Code flow with PKCE
   - No client secret in the browser
2. **Airman's AI Playbook API**
   - Expose a delegated access scope for the web application
   - Set the Application ID URI used as the API token audience
   - Pre-authorize the web application if tenant policy permits

Provide these approved values to the deployment team:

- Tenant ID
- Web application client ID
- API application ID URI or client ID used as the audience
- Production redirect and logout URIs
- Group or app-role assignments

## API configuration

Set:

```dotenv
AUTH_PROVIDER=entra
REQUIRE_MIL_EMAIL=true
ENTRA_TENANT_ID=<tenant-guid>
ENTRA_AUDIENCE=<api-application-id-uri-or-client-id>
# Optional when the tenant uses a nonstandard issuer:
ENTRA_ISSUER=https://login.microsoftonline.com/<tenant-guid>/v2.0
```

The API validates the token signature against Entra's remote JWKS, then checks
the issuer, audience, and `.mil` identity. Requests without a valid token remain
unauthenticated.

## Roles

Define these API app roles in Entra and emit them in the access token's `roles`
claim:

| App role | Platform access |
| --- | --- |
| `viewer` | Read approved content |
| `contributor` | Submit, vote, comment, learn, and message |
| `moderator` | Review submissions and reports |
| `admin` | Manage users, features, analytics, and media |

Assign roles through tenant-managed security groups where possible. Do not use
client-supplied profile fields, rank, or AFSC as authorization claims.

## Browser integration

Replace the local identity selector with an MSAL browser adapter that:

1. Uses Authorization Code flow with PKCE.
2. Requests the delegated API scope.
3. Sends `Authorization: Bearer <access-token>` on API requests.
4. Uses the Entra account claim only to display identity.
5. Clears local application state on logout.
6. Handles interaction-required and expired-token responses without silently
   falling back to mock authentication.

CAC and QR-assisted sign-in behavior is controlled by Entra, Windows, and the
tenant's Conditional Access policy. The application should redirect to Entra
instead of implementing certificate or QR authentication itself.

## Validation matrix

Before production cutover, verify:

- An assigned `.mil` user can sign in and call the API.
- A non-`.mil` identity is rejected.
- An unassigned user receives the intended access-denied experience.
- Each app role can access only its expected routes.
- Expired, wrong-audience, wrong-issuer, and unsigned tokens are rejected.
- Conditional Access behavior works on government-managed desktop and mobile
  devices.
- Logout clears the Entra session according to tenant policy.
- Audit events record the authenticated email and administrative actions.

## Cutover and rollback

Deploy Entra first in a nonproduction environment. Do not enable
`AUTH_PROVIDER=entra` until the web registration and API scope are available.
Rollback is an environment configuration change, but `mock-mil` must never be
used on a production endpoint. If Entra access fails in production, disable the
affected deployment or restore the previous Entra configuration.
