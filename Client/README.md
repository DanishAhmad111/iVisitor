# iVisitor Frontend

Visitor management system frontend built with React and Vite.

## Features

- Visitor request form
- Guard dashboard with authentication
- Real-time visitor status tracking
- Responsive UI with TailwindCSS
- Email approval/rejection flow

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Environment Variables

See `.env.example` for optional environment variables.

## Deployment

### Vercel

This project is configured for deployment on Vercel.

1. Push code to GitHub
2. Import project to Vercel
3. Configure build settings
4. Deploy!

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Routes

- `/` - Landing page
- `/visitor-form` - Visitor request form
- `/guard` - Guard dashboard (protected)
- `/login` - Guard login
- `/approve/:id` - Approval page
- `/reject/:id` - Rejection page
