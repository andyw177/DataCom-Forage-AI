import { seededUsers } from "./users.js";

const seedKudos = [
  {
    id: "k1",
    sender_id: "u2",
    recipient_id: "u1",
    message: "Thanks for jumping in on the client issue and getting us unblocked.",
    is_visible: true,
    created_at: "2026-06-25T14:20:00.000Z",
    updated_at: "2026-06-25T14:20:00.000Z",
    moderated_by: null,
    moderated_at: null,
    reason_for_moderation: null,
    deleted_at: null
  },
  {
    id: "k2",
    sender_id: "u3",
    recipient_id: "u2",
    message: "Appreciate the crisp product brief. It made implementation much smoother.",
    is_visible: true,
    created_at: "2026-06-26T09:05:00.000Z",
    updated_at: "2026-06-26T09:05:00.000Z",
    moderated_by: null,
    moderated_at: null,
    reason_for_moderation: null,
    deleted_at: null
  }
];

export function createStore() {
  return {
    users: structuredClone(seededUsers),
    kudos: structuredClone(seedKudos),
    nextKudosId: 3
  };
}

