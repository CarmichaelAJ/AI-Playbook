# Cloudflare Deployment

The production-shaped stack exposes only the Nginx web service through a remotely managed Cloudflare Tunnel. Nginx proxies `/api/` to the private API container. Postgres remains private to the Docker network.

## One-time setup

1. Create a remotely managed tunnel in Cloudflare Zero Trust.
2. Add a public hostname for the Playbook domain.
3. Set the tunnel service target to `http://web:80`.
4. Copy `.env.cloudflare.example` to a local `.env.cloudflare` file.
5. Put the tunnel token in `CLOUDFLARE_TUNNEL_TOKEN`.

## Start the edge profile

```powershell
docker compose --env-file .env.cloudflare --profile edge up -d --build
```

## Required Cloudflare controls

- Enforce HTTPS and TLS 1.2 or newer.
- Enable managed WAF rules and bot protections appropriate to the hosting authority.
- Disable public caching for `/api/*`.
- Cache immutable static assets only.
- Apply request-size and rate limits at the edge in addition to API limits.
- Restrict the origin so public traffic reaches it only through the tunnel.
- Keep tunnel, Entra, database, and future R2 credentials in the deployment secret store.

## Media

The learning catalog stores approved playback URLs, not video binaries. A Cloudflare R2 bucket can be placed behind a controlled custom domain, or another approved media origin can be used. Publish only URLs approved for the asset's data level.
