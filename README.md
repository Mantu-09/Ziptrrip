# Ziptrrip Todo App

A full-stack todo application built with React (frontend) and Node.js + Express (backend).

The frontend is a **multi-page application (MPA)** - not a single-page application (SPA). It has two completely separate HTML pages. Navigating between them triggers a real browser page load. There is no client-side routing library (React Router is not used).

The backend is a REST API that stores todos in a local JSON file.

---

## Architecture

```
Page 1: index.html  ->  src/main.jsx      ->  pages/Home.jsx   (Todo list)
Page 2: todo.html   ->  src/todo-main.jsx ->  pages/Todo.jsx   (Todo detail)
```

Each page is an independent HTML file with its own React root and its own JS bundle. Clicking a todo title in the list does `window.location.href = '/todo.html?id=<id>'` - a real full-page navigation, not a React state change.

---

## How to run

### 1. Backend

```
cd backend
npm install
npm start
```

Starts the Express server at `http://localhost:5000`.

The data file `backend/data/todos.json` is created automatically when the first todo is saved.

To use a different port, set the `PORT` environment variable before starting.

### 2. Frontend

Open a separate terminal:

```
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

The frontend talks to the backend at `http://localhost:5000` by default. To change that, create a file `frontend/.env`:

```
VITE_API_URL=http://localhost:<your-port>
```

### Pages

| Page | URL |
|------|-----|
| Todo list | `http://localhost:5173/` |
| Todo detail | `http://localhost:5173/todo.html?id=<id>` |

---

## Features

### Todo list page (`/`)

- Displays all todos fetched from the backend on load
- Add a new todo: title (required), description (optional), priority, due date
- Toggle a todo complete or incomplete via checkbox
- Edit a todo inline without leaving the list page
- Delete a todo (shows a confirmation prompt)
- Filter todos: All / Active / Done - with live counts on each tab
- Search todos by title in real time
- Click a todo title to open its detail page (full browser page load)
- Loading state while fetching, error state if backend is unreachable, empty state when no todos exist

### Todo detail page (`/todo.html?id=<id>`)

- Reads the todo ID from the `?id=` URL query parameter
- Fetches the todo from `GET /todos/:id` and displays all its fields: title, description, status badge, priority badge, due date, created date, and UUID
- Edit all fields from this page and save via `PUT /todos/:id`
- Delete the todo from this page - navigates back to the list on success
- Shows a clear error message for three cases:
  - No `?id=` parameter in the URL
  - Todo not found (404 from the API)
  - Backend server is unreachable (network error with a Retry button)

---

## API reference

Base URL: `http://localhost:5000`

| Method | Path | Description | Success | Error |
|--------|------|-------------|---------|-------|
| GET | `/` | Health check | 200 `{ status: "ok" }` | - |
| GET | `/todos` | Return all todos as a JSON array | 200 | - |
| GET | `/todos/:id` | Return a single todo by ID | 200 | 404 if not found |
| POST | `/todos` | Create a new todo | 201 | 400 if title is missing |
| PUT | `/todos/:id` | Partially update a todo (all fields optional) | 200 | 404 if not found |
| DELETE | `/todos/:id` | Delete a todo | 204 | 404 if not found |

### Todo object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | UUID, assigned automatically on creation |
| `title` | string | Required |
| `description` | string | Optional, defaults to `""` |
| `completed` | boolean | Defaults to `false` |
| `priority` | string | `"low"`, `"medium"`, or `"high"` - defaults to `"medium"` |
| `dueDate` | string | ISO date string (`"YYYY-MM-DD"`) or `null` |
| `createdAt` | string | ISO timestamp, set automatically on creation |

---

## Folder structure

```
/
├── .gitignore
├── README.md
│
├── backend/
│   ├── server.js                    Express app entry point
│   ├── package.json
│   ├── routes/
│   │   └── todos.js                 Route definitions (5 endpoints)
│   ├── controllers/
│   │   └── todosController.js       Request handlers for all CRUD operations
│   ├── helpers/
│   │   └── db.js                    Reads and writes todos.json
│   └── data/
│       └── todos.json               Flat-file data store
│
└── frontend/
    ├── index.html                   Entry point for the Todo list page
    ├── todo.html                    Entry point for the Todo detail page
    ├── vite.config.js               Multi-entry MPA build (both HTML files)
    ├── package.json
    └── src/
        ├── main.jsx                 Mounts Home component into index.html
        ├── todo-main.jsx            Mounts TodoDetail component into todo.html
        ├── index.css                Global CSS reset
        ├── api/
        │   └── todos.js             Fetch wrapper for all API calls
        ├── pages/
        │   ├── Home.jsx             Todo list page component
        │   └── Todo.jsx             Todo detail page component
        └── styles/
            ├── Home.css             Styles for the list page
            └── Todo.css             Styles for the detail page
```
