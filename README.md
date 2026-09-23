# Nexgensis Product Operations

A polished Nexgensis product-management dashboard built for the frontend assignment with Next.js, React, Tailwind CSS, Axios and the [DummyJSON API](https://dummyjson.com/docs/products).

## Run locally

1. Use Node.js 18.18 or newer.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:3000`.

The login page is pre-filled with the Nexgensis demo account:

```text
username: nexgensis
password: Nexgensis@2026
```

## Finished features

- Nexgensis-branded login through `POST /auth/login`, persisted client-side session and protected product routes. Because DummyJSON has fixed test accounts, the branded demo access is translated at the API boundary to its documented test account; it is not a real production authentication system.
- One shared Axios client, with a request interceptor that sends the bearer token and a response interceptor that normalises errors / clears an invalid session.
- Product table on desktop and product cards on mobile.
- Server-side pagination with `limit` and `skip`, selectable page sizes (10/20/50), page numbers and Previous/Next controls.
- Debounced search, server-side category filtering and sorting by title, price or rating.
- URL query parameters for page, size, search, category, sort field and direction. Bad values fall back safely; an out-of-range page is corrected after the API returns its total.
- Detail page with product images, description, price, stock and reviews; invalid ids receive a not-found state.
- Validated add/edit forms and a confirmation dialog before deleting.
- Loading skeletons, empty results, request errors and Retry actions.

## Design choices and edge cases

### Search and category filter

DummyJSON offers separate paginated endpoints for product search and category lists but cannot combine a search query with a category in a single server-side result set. To preserve truthful server pagination, the two controls are mutually exclusive: entering a search clears the category, and choosing a category clears the search. The interface explains this whenever search is active.

### Preventing stale search results

Search waits 400 ms after the last keystroke before updating the URL and calling the API. Each request receives an `AbortController` signal and a monotonically increasing request id. A delayed older response therefore cannot replace a newer search result. This holds when testing the API with `&delay=2000`.

### Simulated mutations

DummyJSON deliberately simulates add, update and delete operations rather than persisting them on its server. After each successful mutation, this app stores a compact local overlay in `localStorage`. Updated/deleted products remain changed on later list/detail loads in the same browser; new products are promoted to the first unfiltered page. This keeps the UI honest about API behaviour while still showing the user’s action.

### Duplicate submissions

The Login, Add, Edit and Delete actions lock while their request is pending, so rapid clicking cannot send duplicate requests.

## Project structure

```text
app/                 routes and page shells
components/          focused UI components
lib/api/             shared Axios client and endpoint-specific API functions
lib/local-products/  local overlay for DummyJSON's simulated mutations
lib/session.js       browser session helpers
```

## Challenge note

The main issue was keeping filters shareable in the URL while avoiding race conditions from fast search input. The solution uses the URL as the list state, a debounced input, cancellation and a request sequence guard. AI assisted with initial scaffolding and code review; all API and state-handling choices are documented above and can be explained live.
