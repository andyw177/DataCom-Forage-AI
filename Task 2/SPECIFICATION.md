# Kudos System Specification

## Functional Requirements

### User Stories

1. As a user, I can select another user from a dropdown list so that I can choose who to recognise.
2. As a user, I can write a message of appreciation (max 500 characters) so that I can thank a colleague.
3. As a user, I can submit the kudos which gets stored in the database so that it can be displayed in the portal.
4. As a user, I can view a feed of recent kudos on the dashboard so that recognition is visible across the organisation.
5. As an administrator, I can hide or delete inappropriate kudos messages so that the public feed remains professional and safe.

### Acceptance Criteria

- Only authenticated users can create kudos.
- The user can select only active colleagues from the list.
- Users cannot send kudos to themselves.
- The message field is required and limited to 500 characters.
- A successful submission stores the kudos with sender, recipient, message, and timestamp.
- The dashboard feed displays recent visible kudos in reverse chronological order.
- Only users with administrator privileges can moderate kudos.
- Administrators can hide a kudos message so it no longer appears in the public dashboard feed.
- Administrators can delete a kudos message if it is inappropriate, abusive, spam, or a duplicate.
- Hidden kudos remain stored for audit purposes unless permanently deleted.
- The system records the moderation action, the administrator who performed it, the moderation timestamp, and an optional reason.
- Hidden or deleted kudos must not appear in recent feed results.
- The system rejects exact duplicate submissions from the same sender to the same recipient with the same message inside a short cooldown window.
- The system applies rate limiting to reduce spam-like repeated submissions.
- Non-admin users cannot access moderation actions.
- The system returns clear validation and authorization errors for invalid input or failed moderation actions.

## Technical Design

### Database Schema

- `users`
  - Existing employee table used for authentication and colleague lookup.
  - Assumed fields: `id`, `display_name`, `email`, `is_active`, `role`.

- `kudos`
  - `id`: unique identifier
  - `sender_id`: foreign key to `users.id`
  - `recipient_id`: foreign key to `users.id`
  - `message`: text, max 500 characters
  - `is_visible`: boolean, default `true`
  - `created_at`: timestamp
  - `updated_at`: timestamp
  - `moderated_by`: nullable foreign key to `users.id`
  - `moderated_at`: nullable timestamp
  - `reason_for_moderation`: nullable text
  - `deleted_at`: nullable timestamp if soft delete is used

- Relationships
  - One user can send many kudos.
  - One user can receive many kudos.
  - One administrator can moderate many kudos.

- Recommended indexes
  - `created_at`
  - `is_visible, created_at`
  - `sender_id`
  - `recipient_id`

### API Endpoints

- `GET /api/users?search=`
  - Returns active colleagues for the dropdown/search picker.

- `POST /api/kudos`
  - Creates a new kudos.
  - Request body: `recipient_id`, `message`
  - Sender is derived from the authenticated session.

- `GET /api/kudos?limit=&cursor=`
  - Returns recent visible kudos for the dashboard feed.

- `GET /api/admin/kudos?status=visible|hidden|all`
  - Returns kudos for moderation review.

- `PATCH /api/admin/kudos/{id}`
  - Hides or restores a kudos entry.
  - Request body: `action`, `reason_for_moderation` optional.

- `DELETE /api/admin/kudos/{id}`
  - Deletes a kudos entry.

### Frontend Components

- `KudosForm`
  - Colleague dropdown or searchable picker
  - Message textarea
  - Character counter
  - Submit button
  - Inline validation and submission feedback

- `KudosFeed`
  - Dashboard component showing recent visible kudos
  - Displays sender, recipient, message, and timestamp
  - Supports pagination or load-more behavior

- `AdminKudosModeration`
  - Admin-only moderation screen
  - Filter by visible, hidden, or all
  - Hide, restore, and delete actions
  - Optional moderation reason
  - Moderation metadata display

## Implementation Plan

1. Create `Task 2/SPECIFICATION.md` with the approved requirements and design.
2. Confirm the implementation target before coding. Because there is no existing Task 2 app in this repo, implementation should be treated as a new project.
3. For a future Node + React implementation, scaffold:
   - React frontend for `KudosForm`, `KudosFeed`, and admin moderation UI.
   - Node/Express backend for users, kudos creation, feed retrieval, and moderation APIs.
   - Relational database schema with the `kudos` table and moderation fields.
4. Implement server-side validation for message length, self-kudos prevention, duplicate cooldown, and rate limiting.
5. Implement admin authorization and moderation audit fields.
6. Connect frontend forms and feed views to backend APIs.
7. Add tests for happy paths, moderation flows, duplicate handling, spam prevention, and permissions.

## Assumptions

- The internal portal already has authentication and role-based access control.
- Kudos are public by default unless moderated.
- v1 uses post-submission moderation rather than pre-approval.
- Soft delete is acceptable for auditability, using `deleted_at`.
- The eventual implementation stack should be Node + React if code generation is requested in a non-Plan-Mode turn.