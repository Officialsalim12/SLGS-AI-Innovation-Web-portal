# Place static images here

Files in `public/` are served from the site root.

| Folder | Use for |
|--------|---------|
| `images/brand/` | Logo, favicon assets |
| `images/challenges/` | Challenge hero images |
| `images/sponsors/` | Sponsor logos |
| `images/avatars/` | User / mentor avatars |

Example usage:

```tsx
<img src="/images/brand/logo.svg" alt="GHS" />
// or
<Image src="/images/challenges/ai-health.jpg" alt="..." width={800} height={400} />
```
