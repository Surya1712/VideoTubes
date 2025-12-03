
## Troubleshooting & gotchas

- **FormData / multipart**: Do NOT set Content-Type manually when sending FormData. Let the browser/axios add the multipart boundary (e.g., `apiClient.post('/users/register', formData)`).
- **Auth persistence**: Save accessToken, refreshToken and user to localStorage on login/register. AuthProvider should restore user from localStorage immediately and verify token asynchronously.
- **Authorization header**: Ensure api.js sets Authorization header from localStorage in a request interceptor (read token on each request, not at module init).
- **Backend 404 for subscriptions**: Make sure frontend calls full route (e.g., `/api/v1/subscriptions/c/:channelId`). Use subscription.service to centralize endpoints.
- Inspect network responses and server logs for HTML error pages (500). When backend returns HTML, wrap error handling to show meaningful message.

## Developer notes

- Keep auth logic centralized in AuthContext; authService should return consistent axios responses.
- Interaction endpoints (likes/comments/subscriptions) should return updated counts and status so UI can reconcile optimistic updates.
- Use refresh tokens or token rotation for long sessions; handle 401 responses with a refresh attempt in axios interceptor.

## Testing

- Use Postman or curl to exercise endpoints first (register/login, upload media).
- Ensure Cloudinary credentials are correct for media uploads.

## Contributing

- Create feature branches, keep controller/service responsibilities separated, add unit/integration tests where possible.

If you want, I can:

- Add a sample .env.example for frontend/backend.
- Add api.js interceptor suggestions (set Authorization header from localStorage and handle 401 → refresh).
- Create a quick troubleshooting checklist for the auth refresh flow.
