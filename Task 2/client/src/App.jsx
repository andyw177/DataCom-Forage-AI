import React, { useEffect, useState } from "react";
import {
  createKudos,
  deleteKudos,
  getAdminKudos,
  getFeed,
  getUsers,
  moderateKudos
} from "./api.js";

const maxLength = 500;

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function Feedback({ error, success }) {
  if (!error && !success) {
    return null;
  }

  return (
    <p className={error ? "feedback feedback-error" : "feedback feedback-success"}>
      {error || success}
    </p>
  );
}

function App() {
  const [allUsers, setAllUsers] = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState("u1");
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [feed, setFeed] = useState([]);
  const [feedCursor, setFeedCursor] = useState("0");
  const [nextCursor, setNextCursor] = useState(null);
  const [adminItems, setAdminItems] = useState([]);
  const [adminFilter, setAdminFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminReason, setAdminReason] = useState({});

  const currentUser = allUsers.find((user) => user.id === currentUserId);
  const isAdmin = currentUser?.role === "admin";
  const colleagueOptions = directoryUsers.filter((user) => user.id !== currentUserId);

  async function loadAllUsers(activeUserId = currentUserId) {
    const data = await getUsers(activeUserId, "");
    setAllUsers(data);
    return data;
  }

  async function loadDirectoryUsers(activeUserId = currentUserId, currentSearch = search) {
    const data = await getUsers(activeUserId, currentSearch);
    setDirectoryUsers(data);
    return data;
  }

  async function loadFeed(activeUserId = currentUserId, cursor = "0", append = false) {
    const data = await getFeed(activeUserId, cursor);
    setFeed((previous) => (append ? [...previous, ...data.items] : data.items));
    setFeedCursor(cursor);
    setNextCursor(data.nextCursor);
  }

  async function loadAdmin(activeUserId = currentUserId, status = adminFilter) {
    const viewingUser = allUsers.find((user) => user.id === activeUserId);

    if (viewingUser?.role !== "admin") {
      setAdminItems([]);
      return;
    }

    const data = await getAdminKudos(activeUserId, status);
    setAdminItems(data);
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        const users = await loadAllUsers(currentUserId);
        setDirectoryUsers(users);
        await loadFeed(currentUserId, "0", false);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    async function refreshForUser() {
      try {
        setError("");
        setSuccess("");
        const loadedUsers = await loadAllUsers(currentUserId);
        await loadDirectoryUsers(currentUserId, search);
        const fallbackRecipient =
          loadedUsers.find((user) => user.id !== currentUserId)?.id ?? "";
        setRecipientId((previous) => {
          return previous && previous !== currentUserId ? previous : fallbackRecipient;
        });
        await loadFeed(currentUserId, "0", false);
        if (loadedUsers.find((user) => user.id === currentUserId)?.role === "admin") {
          const data = await getAdminKudos(currentUserId, adminFilter);
          setAdminItems(data);
        } else {
          setAdminItems([]);
        }
      } catch (refreshError) {
        setError(refreshError.message);
      }
    }

    refreshForUser();
  }, [currentUserId]);

  useEffect(() => {
    if (!allUsers.length) {
      return;
    }

    const fallbackRecipient = allUsers.find((user) => user.id !== currentUserId)?.id ?? "";
    if (!recipientId || recipientId === currentUserId) {
      setRecipientId(fallbackRecipient);
    }
  }, [allUsers, currentUserId, recipientId]);

  useEffect(() => {
    async function refreshAdmin() {
      if (!isAdmin) {
        return;
      }

      try {
        await loadAdmin(currentUserId, adminFilter);
      } catch (adminError) {
        setError(adminError.message);
      }
    }

    refreshAdmin();
  }, [adminFilter, isAdmin, allUsers, currentUserId]);

  async function handleSearch(event) {
    const nextSearch = event.target.value;
    setSearch(nextSearch);

    try {
      const data = await getUsers(currentUserId, nextSearch);
      setDirectoryUsers(data);
    } catch (searchError) {
      setError(searchError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createKudos(currentUserId, {
        recipient_id: recipientId,
        message
      });
      setMessage("");
      setSuccess("Kudos sent successfully.");
      await loadFeed(currentUserId, "0", false);
      if (isAdmin) {
        await loadAdmin(currentUserId, adminFilter);
      }
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleModeration(kudosId, action) {
    setError("");
    setSuccess("");

    try {
      await moderateKudos(currentUserId, kudosId, {
        action,
        reason_for_moderation: adminReason[kudosId] || ""
      });
      setSuccess(`Kudos ${action === "hide" ? "hidden" : "restored"} successfully.`);
      await loadFeed(currentUserId, "0", false);
      await loadAdmin(currentUserId, adminFilter);
    } catch (moderationError) {
      setError(moderationError.message);
    }
  }

  async function handleDelete(kudosId) {
    setError("");
    setSuccess("");

    try {
      await deleteKudos(currentUserId, kudosId);
      setSuccess("Kudos deleted successfully.");
      await loadFeed(currentUserId, "0", false);
      await loadAdmin(currentUserId, adminFilter);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleLoadMore() {
    if (!nextCursor) {
      return;
    }

    try {
      await loadFeed(currentUserId, nextCursor, true);
    } catch (loadMoreError) {
      setError(loadMoreError.message);
    }
  }

  if (loading) {
    return <div className="page-shell">Loading...</div>;
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Datacom Internal Portal</p>
          <h1>Kudos Dashboard</h1>
          <p className="hero-copy">
            Celebrate thoughtful teamwork, keep the recognition visible, and give admins the tools
            to keep the feed healthy.
          </p>
        </div>
        <div className="session-card">
          <label htmlFor="current-user">Signed in as</label>
          <select
            id="current-user"
            value={currentUserId}
            onChange={(event) => setCurrentUserId(event.target.value)}
          >
            {allUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.display_name} ({user.role})
              </option>
            ))}
          </select>
        </div>
      </header>

      <Feedback error={error} success={success} />

      <main className="dashboard-grid">
        <section className="panel panel-accent">
          <div className="panel-header">
            <div>
              <p className="panel-label">Give Kudos</p>
              <h2>Recognise a colleague</h2>
            </div>
            <span className="badge">{currentUser?.department}</span>
          </div>

          <label className="field">
            <span>Search colleagues</span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, email, or department"
            />
          </label>

          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field">
              <span>Choose colleague</span>
              <select
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
                disabled={!colleagueOptions.length}
              >
                {colleagueOptions.length ? (
                  colleagueOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name} · {user.department}
                    </option>
                  ))
                ) : (
                  <option value="">No colleagues match this search</option>
                )}
              </select>
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                rows="5"
                maxLength={maxLength}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Call out something specific that helped the team."
              />
              <small>{message.length}/{maxLength} characters</small>
            </label>

            <button className="primary-button" type="submit" disabled={!recipientId}>
              Send Kudos
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">Public Feed</p>
              <h2>Recent kudos</h2>
            </div>
          </div>

          <div className="feed-list">
            {feed.map((item) => (
              <article className="feed-card" key={item.id}>
                <p className="feed-meta">
                  <strong>{item.sender_name}</strong> recognised <strong>{item.recipient_name}</strong>
                </p>
                <p className="feed-message">{item.message}</p>
                <p className="feed-time">{formatDate(item.created_at)}</p>
              </article>
            ))}
          </div>

          {nextCursor ? (
            <button className="secondary-button" type="button" onClick={handleLoadMore}>
              Load more
            </button>
          ) : null}
        </section>

        {isAdmin ? (
          <section className="panel panel-wide">
            <div className="panel-header">
              <div>
                <p className="panel-label">Moderation</p>
                <h2>Admin review queue</h2>
              </div>
              <select value={adminFilter} onChange={(event) => setAdminFilter(event.target.value)}>
                <option value="all">All</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="moderation-list">
              {adminItems.map((item) => (
                <article className="moderation-card" key={item.id}>
                  <div className="moderation-main">
                    <p className="feed-meta">
                      <strong>{item.sender_name}</strong> to <strong>{item.recipient_name}</strong>
                    </p>
                    <p className="feed-message">{item.message}</p>
                    <p className="feed-time">
                      Submitted {formatDate(item.created_at)} · {item.is_visible ? "Visible" : "Hidden"}
                    </p>
                    {item.moderated_at ? (
                      <p className="moderation-meta">
                        Last moderated by {item.moderated_by_name} on {formatDate(item.moderated_at)}
                      </p>
                    ) : null}
                  </div>

                  <div className="moderation-actions">
                    <textarea
                      rows="3"
                      placeholder="Optional moderation reason"
                      value={adminReason[item.id] || ""}
                      onChange={(event) =>
                        setAdminReason((previous) => ({
                          ...previous,
                          [item.id]: event.target.value
                        }))
                      }
                    />
                    <div className="button-row">
                      {item.is_visible ? (
                        <button type="button" className="secondary-button" onClick={() => handleModeration(item.id, "hide")}>
                          Hide
                        </button>
                      ) : (
                        <button type="button" className="secondary-button" onClick={() => handleModeration(item.id, "restore")}>
                          Restore
                        </button>
                      )}
                      <button type="button" className="danger-button" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
