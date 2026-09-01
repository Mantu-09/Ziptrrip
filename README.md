# Ziptrrip

A small full-stack todo app. The backend is a Node/Express REST API that persists data to a local JSON file. The frontend is a React (Vite) SPA with two pages: a todo list and a todo detail view.

---

## Running the project

### 1. Backend

```
cd backend
npm install
npm start
```

The server starts on `http://localhost:5000`. The file `backend/data/todos.json` is created automatically on first write.

To use a different port, set the `PORT` environment variable before starting.

### 2. Frontend

In a separate terminal:

```
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The frontend expects the backend on port 5000. To change that, create `frontend/.env` with:

```
VITE_API_URL=http://localhost:<your-port>
```

---

## Features

**Todo list page (`/`)**

- Fetches and displays all todos on load
- Add a new todo with title (required), description, priority, and due date
- Check the checkbox to toggle a todo complete or incomplete
- Edit a todo inline without leaving the list
- Delete a todo with a confirmation prompt
- Filter the list by All / Active / Done
- Search todos by title in real time
- Click a todo title to open its detail page

**Todo detail page (`/todo?id=<id>`)**

- Loads a single todo by ID from the URL query parameter
- Displays all fields: title, description, status, priority, due date, created date, and ID
- Edit all fields from this page and save via PUT
- Delete the todo from this page; redirects back to the list on success
- Shows a clear error message when the ID is missing, the todo is not found (404), or the server is unreachable

---

## API reference

All routes are prefixed at `http://localhost:5000`.

| Method | Path          | Description                                              |
|--------|---------------|----------------------------------------------------------|
| GET    | `/`           | Health check — returns `{ status: "ok" }`                |
| GET    | `/todos`      | Return all todos as a JSON array                         |
| GET    | `/todos/:id`  | Return a single todo; 404 if not found                   |
| POST   | `/todos`      | Create a todo; `title` is required; returns 201          |
| PUT    | `/todos/:id`  | Partial update; all fields optional; 404 if not found    |
| DELETE | `/todos/:id`  | Delete a todo; returns 204; 404 if not found             |

**Todo fields**

| Field         | Type    | Notes                          |
|---------------|---------|--------------------------------|
| `id`          | string  | UUID, assigned on creation     |
| `title`       | string  | Required                       |
| `description` | string  | Optional, defaults to `""`    |
| `completed`   | boolean | Defaults to `false`            |
| `priority`    | string  | `"low"`, `"medium"`, `"high"` — defaults to `"medium"` |
| `dueDate`     | string  | ISO date string or `null`      |
| `createdAt`   | string  | ISO timestamp, set on creation |

---

## Folder structure

```
/
├── .gitignore
├── README.md
├── backend/
│   ├── server.js               # Express app, middleware, route mounting
│   ├── routes/
│   │   └── todos.js            # Route definitions
│   ├── controllers/
│   │   └── todosController.js  # Request handlers
│   ├── helpers/
│   │   └── db.js               # Read/write todos.json
│   └── data/
│       └── todos.json          # Flat-file data store
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Router setup
        ├── index.css           # Global reset
        ├── api/
        │   └── todos.js        # Fetch wrapper for all API calls
        ├── pages/
        │   ├── Home.jsx        # Todo list page (/)
        │   └── Todo.jsx        # Todo detail page (/todo)
        └── styles/
            ├── Home.css        # List page styles
            └── Todo.css        # Detail page styles
```
