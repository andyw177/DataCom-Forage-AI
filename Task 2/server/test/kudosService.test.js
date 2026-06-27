import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/data/store.js";
import { createKudosService } from "../src/services/kudosService.js";

function buildService(isoTime) {
  return createKudosService(createStore(), {
    now: () => new Date(isoTime)
  });
}

test("creates kudos for a valid authenticated user", () => {
  const service = buildService("2026-06-26T12:00:00.000Z");

  const created = service.createKudos("u1", {
    recipient_id: "u2",
    message: "Thanks for making the sprint review so clear."
  });

  assert.equal(created.sender_id, "u1");
  assert.equal(created.recipient_id, "u2");
  assert.equal(created.is_visible, true);
});

test("rejects self-kudos submissions", () => {
  const service = buildService("2026-06-26T12:00:00.000Z");

  assert.throws(
    () =>
      service.createKudos("u1", {
        recipient_id: "u1",
        message: "Self high five"
      }),
    /cannot send kudos to yourself/i
  );
});

test("rejects duplicate submissions inside the cooldown window", () => {
  const service = buildService("2026-06-26T09:08:00.000Z");

  assert.throws(
    () =>
      service.createKudos("u3", {
        recipient_id: "u2",
        message: "Appreciate the crisp product brief. It made implementation much smoother."
      }),
    /duplicate kudos/i
  );
});

test("hidden kudos are excluded from the public feed", () => {
  const service = buildService("2026-06-26T12:00:00.000Z");

  service.moderateKudos("u4", "k2", {
    action: "hide",
    reason_for_moderation: "Spam"
  });

  const feed = service.listFeed("u1", {});

  assert.equal(feed.items.some((item) => item.id === "k2"), false);
});

test("non-admin users cannot access moderation actions", () => {
  const service = buildService("2026-06-26T12:00:00.000Z");

  assert.throws(
    () =>
      service.moderateKudos("u1", "k1", {
        action: "hide"
      }),
    /administrator access required/i
  );
});

