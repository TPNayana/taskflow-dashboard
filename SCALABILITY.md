Scalability Strategy

Currently, this application is a Monolith (all code in one place) suitable for a prototype. To scale this for production use, I would implement the following:

### 1. Backend Optimization
- **Separation of Concerns:** I would separate the Frontend and Backend into different hosting environments (e.g., Vercel for Frontend, Render/AWS for Backend) so they don't slow each other down.
- **Caching:** I would implement caching (using Redis) for the Task List API. This ensures that if a user refreshes the page 10 times, we don't hit the main database 10 times, saving resources.

### 2. Database Scaling
- **Indexing:** I have ensured that the `user_id` field in MongoDB is indexed. This makes searching for a specific user's tasks much faster as the database grows.
- **Cloud Hosting:** Moving from a local database to a managed cluster (like MongoDB Atlas) to handle automatic backups and scaling.

### 3. Frontend Performance
- **Lazy Loading:** I would use React's `Suspense` and `lazy()` to load the Calendar widget only when the user actually clicks that tab, making the initial page load faster.
- **Asset Optimization:** Compressing images and CSS files to ensure the app loads quickly on mobile networks.