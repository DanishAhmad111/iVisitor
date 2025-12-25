# iVisitor Backend

Visitor management system backend API built with Node.js, Express, and Prisma.

## Features

- RESTful API for visitor management
- Email notifications with approval/rejection links
- Secure token-based approval system
- PostgreSQL database with Prisma ORM
- CORS enabled for cross-origin requests

## Tech Stack

- **Runtime**: Node.js >= 18
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Email**: Nodemailer

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

### Render

This project is configured for deployment on Render using `render.yaml`.

1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables
4. Deploy!

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Run production server
npm start
```

## API Endpoints

- `POST /api/visitor-request` - Submit visitor request
- `GET /api/visitor/:id` - Get visitor details
- `PUT /api/visitor-status/:id` - Update visitor status
- `GET /api/approve/:id/:token` - Approve visitor via email
- `GET /api/reject/:id/:token` - Reject visitor via email
- `POST /api/guard-verify` - Verify visitor code
- `PUT /api/visitor-exit/:id` - Mark visitor exit
- `GET /api/visitors` - Get all visitors
