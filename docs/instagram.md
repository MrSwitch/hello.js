Instagram OAuth Deprecation Notice

Instagram has fully deprecated its standalone OAuth API.
The old endpoints (https://instagram.com/oauth/authorize/) no longer work and always return a cancellation error or 405 on logout.

This provider is deprecated unless rewritten to use Facebook Graph API with server-side login.

Logout has been updated to use POST + CSRF token when possible, but the Instagram API still blocks cross-site logout.