import {
  DEFAULT_PAGE_SIZE,
  DUPLICATE_COOLDOWN_MS,
  MESSAGE_MAX_LENGTH,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS
} from "../config.js";

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function sortNewestFirst(items) {
  return [...items].sort((left, right) => {
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

export function createKudosService(store, options = {}) {
  const now = options.now ?? (() => new Date());

  function getUserById(userId) {
    return store.users.find((user) => user.id === userId) ?? null;
  }

  function requireAuthenticatedUser(userId) {
    const user = getUserById(userId);
    if (!user || !user.is_active) {
      throw createError(401, "Authentication required.");
    }
    return user;
  }

  function requireAdmin(userId) {
    const user = requireAuthenticatedUser(userId);
    if (user.role !== "admin") {
      throw createError(403, "Administrator access required.");
    }
    return user;
  }

  function serializeKudos(kudos) {
    const sender = getUserById(kudos.sender_id);
    const recipient = getUserById(kudos.recipient_id);
    const moderator = kudos.moderated_by ? getUserById(kudos.moderated_by) : null;

    return {
      ...kudos,
      sender_name: sender?.display_name ?? "Unknown sender",
      recipient_name: recipient?.display_name ?? "Unknown recipient",
      moderated_by_name: moderator?.display_name ?? null
    };
  }

  return {
    listUsers(currentUserId, search = "") {
      requireAuthenticatedUser(currentUserId);
      const query = safeText(search).toLowerCase();

      return store.users
        .filter((user) => user.is_active)
        .filter((user) => {
          if (!query) {
            return true;
          }

          return (
            user.display_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.department.toLowerCase().includes(query)
          );
        })
        .map((user) => ({
          id: user.id,
          display_name: user.display_name,
          department: user.department,
          email: user.email,
          role: user.role
        }));
    },

    createKudos(currentUserId, payload) {
      const sender = requireAuthenticatedUser(currentUserId);
      const recipientId = safeText(payload?.recipient_id);
      const message = safeText(payload?.message);

      if (!recipientId) {
        throw createError(400, "Please choose a colleague.");
      }

      if (!message) {
        throw createError(400, "Please enter a message.");
      }

      if (message.length > MESSAGE_MAX_LENGTH) {
        throw createError(400, `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`);
      }

      if (recipientId === sender.id) {
        throw createError(400, "You cannot send kudos to yourself.");
      }

      const recipient = getUserById(recipientId);
      if (!recipient || !recipient.is_active) {
        throw createError(400, "Please choose an active colleague.");
      }

      const currentTime = now();
      const recentWindowStart = currentTime.getTime() - RATE_LIMIT_WINDOW_MS;
      const duplicateWindowStart = currentTime.getTime() - DUPLICATE_COOLDOWN_MS;
      const activeKudos = store.kudos.filter((kudos) => !kudos.deleted_at);

      const recentSubmissions = activeKudos.filter((kudos) => {
        return (
          kudos.sender_id === sender.id &&
          new Date(kudos.created_at).getTime() >= recentWindowStart
        );
      });

      if (recentSubmissions.length >= RATE_LIMIT_MAX) {
        throw createError(429, "Rate limit reached. Please wait before sending more kudos.");
      }

      const duplicate = activeKudos.find((kudos) => {
        return (
          kudos.sender_id === sender.id &&
          kudos.recipient_id === recipientId &&
          kudos.message.toLowerCase() === message.toLowerCase() &&
          new Date(kudos.created_at).getTime() >= duplicateWindowStart
        );
      });

      if (duplicate) {
        throw createError(409, "Duplicate kudos detected. Please wait before sending it again.");
      }

      const timestamp = currentTime.toISOString();
      const newKudos = {
        id: `k${store.nextKudosId++}`,
        sender_id: sender.id,
        recipient_id: recipientId,
        message,
        is_visible: true,
        created_at: timestamp,
        updated_at: timestamp,
        moderated_by: null,
        moderated_at: null,
        reason_for_moderation: null,
        deleted_at: null
      };

      store.kudos.push(newKudos);
      return serializeKudos(newKudos);
    },

    listFeed(currentUserId, query) {
      requireAuthenticatedUser(currentUserId);
      const limit = Math.max(1, Math.min(20, toInt(query?.limit, DEFAULT_PAGE_SIZE)));
      const cursor = Math.max(0, toInt(query?.cursor, 0));

      const visibleKudos = sortNewestFirst(
        store.kudos.filter((kudos) => kudos.is_visible && !kudos.deleted_at)
      );
      const items = visibleKudos.slice(cursor, cursor + limit).map(serializeKudos);
      const nextCursor = cursor + limit < visibleKudos.length ? String(cursor + limit) : null;

      return {
        items,
        nextCursor
      };
    },

    listAdminKudos(currentUserId, query) {
      requireAdmin(currentUserId);
      const status = safeText(query?.status) || "all";
      const visibleFilter = {
        visible: (item) => item.is_visible && !item.deleted_at,
        hidden: (item) => !item.is_visible && !item.deleted_at,
        all: (item) => !item.deleted_at
      }[status];

      if (!visibleFilter) {
        throw createError(400, "Invalid moderation filter.");
      }

      return sortNewestFirst(store.kudos.filter(visibleFilter)).map(serializeKudos);
    },

    moderateKudos(currentUserId, kudosId, payload) {
      const admin = requireAdmin(currentUserId);
      const action = safeText(payload?.action).toLowerCase();
      const reason = safeText(payload?.reason_for_moderation) || null;
      const kudos = store.kudos.find((item) => item.id === kudosId && !item.deleted_at);

      if (!kudos) {
        throw createError(404, "Kudos not found.");
      }

      if (!["hide", "restore"].includes(action)) {
        throw createError(400, "Invalid moderation action.");
      }

      kudos.is_visible = action === "restore";
      kudos.updated_at = now().toISOString();
      kudos.moderated_by = admin.id;
      kudos.moderated_at = kudos.updated_at;
      kudos.reason_for_moderation = reason;

      return serializeKudos(kudos);
    },

    deleteKudos(currentUserId, kudosId) {
      const admin = requireAdmin(currentUserId);
      const kudos = store.kudos.find((item) => item.id === kudosId && !item.deleted_at);

      if (!kudos) {
        throw createError(404, "Kudos not found.");
      }

      const timestamp = now().toISOString();
      kudos.deleted_at = timestamp;
      kudos.updated_at = timestamp;
      kudos.moderated_by = admin.id;
      kudos.moderated_at = timestamp;
      kudos.reason_for_moderation = kudos.reason_for_moderation ?? "Deleted by administrator";

      return { success: true };
    }
  };
}

