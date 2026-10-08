# AI-DS Visualizer Pro

AI-Powered Data Structures and Algorithms Interactive Learning & Visualization Platform.

## Requirements

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *(Optional for backend services)*: Python 3.11+

## Installation

Clone the repository and install all dependencies directly from the project root:

```bash
git clone https://github.com/SairajAgawane/AI--DS-Visualizer-Pro.git
cd AI--DS-Visualizer-Pro
npm install
```

*(You can also run commands from inside the `frontend/` directory if preferred).*

## Development

Start the local development server:

```bash
npm run dev
```

The application will be accessible at: `http://localhost:5173`

## Production Build

Compile TypeScript and build the production-optimized Vite bundle:

```bash
npm run build
```

The compiled assets are generated in `frontend/dist`.

## Preview

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |
| `VITE_GOOGLE_CLIENT_ID` | Optional Google OAuth Web Client ID | *(empty)* |

> **Security Note**: Never commit `.env` or sensitive credentials to GitHub. All `.env` files are strictly protected by `.gitignore`.

## Deployment

### GitHub Repository
- **Official Repository**: [https://github.com/SairajAgawane/AI--DS-Visualizer-Pro](https://github.com/SairajAgawane/AI--DS-Visualizer-Pro)
- **Default Branch**: `main`

### Vercel Deployment
- **Live Production URL**: [https://ai-ds-visualizer-c15ct0c07-sais-projects-3ea77644.vercel.app/](https://ai-ds-visualizer-c15ct0c07-sais-projects-3ea77644.vercel.app/)
- **Configuration**: `vercel.json` includes client-side SPA rewrites (`"source": "/(.*)", "destination": "/index.html"`), ensuring routes like `/playground/array`, `/dashboard`, and `/admin` resolve without 404s.
- Automatic deployments trigger on every push to `main`.

---

## Supported Chapters & Visualizers

1. **Array**: Create, Traverse, Insert, Delete, Update, Linear Search
2. **Stack**: Push, Pop, Peek, Display, Array Stack, Linked Stack
3. **Queue**: Enqueue, Dequeue, Front, Rear, Display
4. **Circular Queue**: Enqueue, Dequeue, Wrap Around
5. **Linked List**: Create, Head/Tail/Position Insert, Delete, Search, Traverse
6. **Doubly Linked List**: Forward & Backward Traversals, Insert, Delete
7. **Binary Tree**: Inorder, Preorder, Postorder, Level-Order
8. **Binary Search Tree (BST)**: Insert, Search, Delete, Tree Traversals
9. **Heap**: Create, Insert, Bubble Up, Extract Min/Max, Heap Sort
10. **Graph**: Vertices, Weighted/Unweighted Edges, BFS, DFS
11. **Searching**: Linear Search, Binary Search
12. **Sorting**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort
13. **Hash Table**: Buckets, Key-Value Insertion, Search, Collision Handling
14. **Recursion**: Factorial, Fibonacci, Recursive Sum, Binary Search
