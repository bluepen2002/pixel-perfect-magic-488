# Roadmap

## Open
- [ ] M-Pesa Daraja integration — waiting on user's Safaricom credentials (Consumer Key/Secret, Passkey, Shortcode)
- [ ] Phone OTP auth — needs an SMS provider account (e.g. Twilio); on hold like M-Pesa

## Done
- [x] Published Lift1 publicly (2026-10-04); sample data deleted, demo tables locked to admins, security findings marked fixed
- [x] Recurring giving: ONE_TIME/WEEKLY/MONTHLY pledge toggle on Contribute, recurrence badge on dashboard history (2026-10-05)
- [x] Impact stories: impact_stories table, public section on /transparency, admin editor at /admin/stories (2026-10-05)
- [x] Invite a friend: share card on dashboard (Web Share API + clipboard fallback) (2026-10-05)
- [x] In-app notifications: notifications table, trigger on request_status_events, bell with unread count in AppShell, /notifications page (2026-10-05)

- [x] Fund breakdown, admin review queue (7+ day flag), welcome slides, modern look on Transparency/Notifications/admin, contribution receipts (2026-10-07)

## Later (from spec, not yet built)
- KYC provider abstraction
- Email/push notifications, audit logging, legal review gate
