# LinkVault — MERN URL Shortener

A full-stack URL shortener built with MongoDB, Express.js, React, and Node.js.

## Features

- Convert long URLs into short, shareable links.
- Redirect short links to their original destinations.
- Store links persistently in MongoDB.
- Track the number of clicks on each link.
- Copy short links to the clipboard.
- Responsive interface for desktop and mobile devices.
- Validate URLs and accept only HTTP and HTTPS protocols.

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Version Control:** Git and GitHub

## Project Structure

```text
linkvault/
├── client/          # React frontend
├── server/
│   └── server.js    # Express API and redirect routes
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js (LTS)
- npm
- A MongoDB Atlas database

## Local Setup

1. Clone the repository.
2. Install the root dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   npm install --prefix client
   ```

4. Create a `.env` file in the project root and configure:

   ```dotenv
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```

5. Start the backend in one terminal:

   ```bash
   npm run dev
   ```

6. Start the frontend in a second terminal:

   ```bash
   cd client
   npm run dev
   ```

7. Open `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| POST | `/api/urls` | Create a short URL |
| GET | `/api/urls` | List saved URLs |
| GET | `/:code` | Redirect to the original URL |

### Create a short URL

Example request body:

```json
{
  "originalUrl": "https://example.com"
}
```

The API returns the original URL, generated short code, short link, click count, and creation timestamp.

## Production Build

Build the React frontend from the project root:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Configure `MONGODB_URI` in your hosting provider's environment variables.

## Security Notes

- Keep `.env` out of version control.
- Use a restricted database user.
- Validate input URLs.
- Add rate limiting and abuse protection before production use.

## Future Improvements

- Custom short aliases
- QR code generation
- Link expiration
- Search and pagination
- Analytics dashboard
- User authentication

## Author

Created as a full-stack web development project for college club recruitment.