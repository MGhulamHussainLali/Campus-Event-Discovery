# Campus Event Discovery
Outstanding Items — Scaling & Optimization (Deferred)
Database-level

Missing indexes on frequently queried/filtered columns:

Event.organizer_id, Event.category_id, Event.organization_id, Event.status
Registration.event_id, Registration.student_id
Notifications.user_id, Notifications.is_read
Refresh_Token.token_hash, Email_Verification_Token.token_hash, Password_Reset_Token.token_hash
Login_Attempt.email, Login_Attempt.attempted_at


Event title search (ILIKE '%term%') can't use a standard B-tree index (leading wildcard) — needs pg_trgm trigram index or full-text search (tsvector) at scale.
No pagination on any list endpoint (Event, Registration, Notification) — needed both for UX and to avoid unbounded result sets as data grows.
Connection pooling — pg.Pool currently uses defaults; no explicit max connections, idle timeout, or statement timeout configured.
No read replicas / PgBouncer / partitioning — not yet needed at current scale, but undecided for future growth.
ON DELETE CASCADE — deliberately not used; deleting a user requires manual dependent-row cleanup in the service layer, not yet fully implemented.

Caching / Redis

Login attempt tracking — currently pure Postgres; noted as a Redis migration candidate for high-frequency counter workloads.
Platform Settings cache — in-memory cache-aside pattern designed but not implemented; explicitly breaks under horizontal scaling (each Node instance would have its own stale cache) — Redis would provide a shared cache across instances.
Refresh token / session validity caching — currently a Postgres hash lookup on every /refresh call; could cache active session validity in Redis to reduce DB round-trips.
Rate limiting — currently SQL-based (Login_Attempt count query); standard production pattern is Redis INCR + EXPIRE for atomic, faster request-level rate limiting.
Event/Category/Interest list caching — these are read-heavy, write-rare; caching in Redis with TTL or explicit invalidation-on-write would reduce DB load significantly at scale.

Also still open (non-scaling)

Postman collection — not yet created.
Automated tests — none written yet.
Frontend — not started.
WebSocket real-time layer (settings/event status updates) — planned, not implemented.
RAG-based semantic search — planned, deferred until core is stable.