const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const fetchTodos  = ()         => request('/todos');
export const fetchTodo   = (id)       => request(`/todos/${id}`);
export const createTodo  = (data)     => request('/todos',       { method: 'POST',   body: JSON.stringify(data) });
export const updateTodo  = (id, data) => request(`/todos/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const deleteTodo  = (id)       => request(`/todos/${id}`, { method: 'DELETE' });
