import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../api/todos';
import '../styles/Todo.css';

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  // Append time so the Date constructor treats this as local, not UTC midnight
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function BackBtn({ onClick }) {
  return (
    <button className="back-btn" onClick={onClick}>
      ← Back to list
    </button>
  );
}

export default function TodoDetail() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const id             = searchParams.get('id');

  const [todo,     setTodo]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);  // null | 'no_id' | 'not_found' | 'network'

  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('no_id');
      return;
    }
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchTodo(id);
      setTodo(data);
    } catch (err) {
      const msg = err.message.toLowerCase();
      setError(msg.includes('not found') || msg.includes('404') ? 'not_found' : 'network');
    } finally {
      setLoading(false);
    }
  }

  function startEdit() {
    setForm({
      title:       todo.title,
      description: todo.description ?? '',
      priority:    todo.priority    ?? 'medium',
      dueDate:     todo.dueDate     ?? '',
      completed:   todo.completed,
    });
    setEditing(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const updated = await api.updateTodo(id, { ...form, dueDate: form.dueDate || null });
      setTodo(updated);
      setEditing(false);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this todo? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteTodo(id);
      navigate('/');
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <BackBtn onClick={() => navigate('/')} />
        <p className="state-msg">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <BackBtn onClick={() => navigate('/')} />
        <div className="not-found-box">
          {error === 'no_id' && (
            <>
              <span className="not-found-icon">🔍</span>
              <h2>No ID provided</h2>
              <p>Open a todo from the list to see its detail page.</p>
              <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                Go to list
              </button>
            </>
          )}
          {error === 'not_found' && (
            <>
              <span className="not-found-icon">🗒️</span>
              <h2>Todo not found</h2>
              <p>This todo may have been deleted or the link is invalid.</p>
              <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                Go to list
              </button>
            </>
          )}
          {error === 'network' && (
            <>
              <span className="not-found-icon">⚡</span>
              <h2>Could not load todo</h2>
              <p>Make sure the backend is running on port 5000.</p>
              <button className="btn btn-primary" onClick={load} style={{ marginTop: '1rem' }}>
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="detail-page">
        <BackBtn onClick={() => navigate('/')} />
        <div className="detail-card">
          <div className="detail-edit">
            <h2 className="detail-section-title">Edit Todo</h2>

            <div>
              <label className="field-label">Title <span className="required">*</span></label>
              <input
                className="input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea
                className="input"
                rows={4}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description…"
              />
            </div>

            <div className="edit-row">
              <div className="edit-col">
                <label className="field-label">Priority</label>
                <select
                  className="input select"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="edit-col">
                <label className="field-label">Due date</label>
                <input
                  className="input"
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.completed}
                onChange={e => setForm(f => ({ ...f, completed: e.target.checked }))}
              />
              Mark as completed
            </label>

            <div className="edit-actions">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="btn" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <BackBtn onClick={() => navigate('/')} />

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title-row">
            <h1 className={`detail-title${todo.completed ? ' done' : ''}`}>
              {todo.title}
            </h1>
            <span className={`status-badge${todo.completed ? ' status-done' : ' status-active'}`}>
              {todo.completed ? 'Completed' : 'Active'}
            </span>
          </div>
          <div className="detail-toolbar">
            <button className="btn" onClick={startEdit}>✏️ Edit</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : '🗑️ Delete'}
            </button>
          </div>
        </div>

        {todo.description && (
          <p className="detail-description">{todo.description}</p>
        )}

        <dl className="detail-fields">
          <div className="field-row">
            <dt>Priority</dt>
            <dd>
              <span className={`priority-badge priority-${todo.priority}`}>
                {PRIORITY_LABEL[todo.priority] ?? todo.priority}
              </span>
            </dd>
          </div>
          <div className="field-row">
            <dt>Due date</dt>
            <dd>
              {todo.dueDate
                ? formatDate(todo.dueDate)
                : <span className="muted">—</span>}
            </dd>
          </div>
          <div className="field-row">
            <dt>Status</dt>
            <dd>{todo.completed ? 'Completed' : 'Active'}</dd>
          </div>
          <div className="field-row">
            <dt>Created</dt>
            <dd>{formatDateTime(todo.createdAt)}</dd>
          </div>
          <div className="field-row">
            <dt>ID</dt>
            <dd><span className="id-value">{todo.id}</span></dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
