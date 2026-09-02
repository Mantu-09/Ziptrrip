import { useState, useEffect, useMemo } from 'react';
import * as api from '../api/todos';
import '../styles/Home.css';

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
const EMPTY_FORM     = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function Home() {
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [filter, setFilter] = useState('all');  // 'all' | 'active' | 'completed'
  const [search, setSearch] = useState('');

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setTodos(await api.fetchTodos());
    } catch {
      setError('Could not reach the server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return todos
      .filter(t => {
        if (filter === 'active')    return !t.completed;
        if (filter === 'completed') return  t.completed;
        return true;
      })
      .filter(t => !q || t.title.toLowerCase().includes(q));
  }, [todos, filter, search]);

  const counts = useMemo(() => ({
    total:     todos.length,
    active:    todos.filter(t => !t.completed).length,
    completed: todos.filter(t =>  t.completed).length,
  }), [todos]);

  function patch(updated) {
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
  }

  function formatDate(dateStr) {
    if (!dateStr) return null;
    // Append time so the Date constructor treats this as local, not UTC midnight
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      const todo = await api.createTodo({ ...form, dueDate: form.dueDate || null });
      setTodos(prev => [...prev, todo]);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert(`Failed to add todo: ${err.message}`);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(todo) {
    try {
      patch(await api.updateTodo(todo.id, { completed: !todo.completed }));
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this todo?')) return;
    try {
      await api.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      if (editId === id) setEditId(null);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  }

  function startEdit(todo) {
    setEditId(todo.id);
    setEditForm({
      title:       todo.title,
      description: todo.description ?? '',
      priority:    todo.priority    ?? 'medium',
      dueDate:     todo.dueDate     ?? '',
    });
  }

  async function handleEditSave(id) {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      patch(await api.updateTodo(id, { ...editForm, dueDate: editForm.dueDate || null }));
      setEditId(null);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function openDetail(id) {
    // Navigate to the detail page — a real page load, not client-side routing
    window.location.href = `/todo.html?id=${id}`;
  }

  return (
    <div className="page">

      <header className="page-header">
        <h1>My Todos</h1>
        <p className="summary">
          {counts.total} task{counts.total !== 1 ? 's' : ''}
          {counts.completed > 0 && ` · ${counts.completed} completed`}
        </p>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <div className="add-row">
          <input
            className="input"
            placeholder="Add a new todo…"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <button className="btn btn-primary" type="submit" disabled={adding || !form.title.trim()}>
            {adding ? 'Adding…' : '+ Add'}
          </button>
        </div>
        <div className="add-extras">
          <textarea
            className="input"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="add-meta">
            <select
              className="input select"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
        </div>
      </form>

      <div className="controls">
        <div className="filters">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all'       ? `All (${counts.total})`       :
               f === 'active'    ? `Active (${counts.active})`   :
               `Done (${counts.completed})`}
            </button>
          ))}
        </div>
        <input
          className="input search-input"
          placeholder="🔍  Search by title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="state-msg">Loading todos…</p>}

      {error && (
        <div className="error-box">
          <span>{error}</span>
          <button className="btn" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        visible.length === 0 ? (
          <p className="state-msg empty">
            {todos.length === 0
              ? 'No todos yet — add one above!'
              : 'No todos match your filter / search.'}
          </p>
        ) : (
          <ul className="todo-list">
            {visible.map(todo => (
              <li key={todo.id} className={`todo-item${todo.completed ? ' done' : ''}`}>

                {editId === todo.id ? (
                  <div className="edit-form">
                    <input
                      className="input"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Title"
                      autoFocus
                    />
                    <textarea
                      className="input"
                      rows={2}
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description"
                    />
                    <div className="edit-meta">
                      <select
                        className="input select"
                        value={editForm.priority}
                        onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input
                        className="input"
                        type="date"
                        value={editForm.dueDate}
                        onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))}
                      />
                    </div>
                    <div className="edit-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditSave(todo.id)}
                        disabled={saving || !editForm.title.trim()}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button className="btn" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      className="todo-check"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                      title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                    />
                    <div className="todo-body">
                      <button
                        className="todo-title"
                        onClick={() => openDetail(todo.id)}
                        title="View detail"
                      >
                        {todo.title}
                      </button>
                      {todo.description && (
                        <p className="todo-desc">{todo.description}</p>
                      )}
                      <div className="todo-meta">
                        <span className={`priority-badge priority-${todo.priority}`}>
                          {PRIORITY_LABEL[todo.priority] ?? todo.priority}
                        </span>
                        {todo.dueDate && (
                          <span className="due-date">Due {formatDate(todo.dueDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button className="btn btn-sm"            onClick={() => startEdit(todo)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(todo.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )
      )}

    </div>
  );
}
