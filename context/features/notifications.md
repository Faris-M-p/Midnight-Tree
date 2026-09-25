# Notifications

Status: **Not implemented**. The shell shows an empty drawer.

## What the UI does

`src/components/layout/Header.tsx` opens `NotificationDrawer`.

`unreadNotificationCount()` in `NotificationDrawer.tsx` returns `0`.

The drawer title is “Notifications” and the subtitle mentions birthdays, stories, events, and family updates. The body is `EmptyState`: “No notifications” / “Family updates will appear here.”

It does not read Firestore. There is no `notifications` collection in `FIRESTORE_COLLECTIONS`.

## Mock data that is not wired

`src/data/mockNotifications.ts` exports `mockNotifications` with kinds `birthday`, `anniversary`, `event`, `story`, `other`. The drawer does not import that file.

Home still shows upcoming birthdays and events as dashboard sections (`buildUpcomingDates`). Those are computed lists on the home page, not notification records.

## Toasts

`src/utils/notify.tsx` is Sonner toasts for save/error feedback. That is not a notification inbox.

## Not implemented

- Persist notifications
- Mark as read
- Push, email, or scheduled reminders
- Click-through from a stored notification to a member or event
