# VideoTube Frontend

A modern, production-ready frontend for a YouTube-like video hosting platform built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Authentication & User Management
- **Secure Authentication**: Email/password login and registration with JWT tokens
- **User Profiles**: Customizable profiles with avatar and cover image support
- **Password Management**: Forgot password, reset password, and change password functionality
- **Protected Routes**: Automatic redirection and route protection based on authentication state

### Video Features
- **Video Upload**: Multi-part file upload with progress tracking
- **Video Player**: Custom HTML5 video player with full controls (play/pause, seek, volume, fullscreen)
- **Video Management**: Upload, edit, delete, and publish/unpublish videos
- **Video Interactions**: Like, dislike, and view count tracking
- **Comments System**: Add, edit, delete comments with nested replies support

### User Interface
- **Responsive Design**: Mobile-first design that works perfectly on all devices
- **Dark/Light Mode**: System preference detection with manual toggle
- **Modern UI**: Clean, YouTube-inspired interface with smooth animations
- **Search Functionality**: Real-time video search with results page
- **Navigation**: Intuitive sidebar navigation with user-specific sections

### Content Discovery
- **Home Feed**: Personalized video recommendations
- **Trending**: Popular and trending videos
- **Subscriptions**: Videos from subscribed channels
- **Watch History**: Track and revisit previously watched videos
- **Channel Pages**: Dedicated pages for each content creator

### Social Features
- **Subscriptions**: Subscribe/unsubscribe to channels with notification system
- **Engagement**: Like, dislike, comment, and reply to videos
- **User Profiles**: View channel information, subscriber counts, and video collections

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom dark/light theme support
- **State Management**: React Context API for global state
- **HTTP Client**: Axios with interceptors for API communication
- **Routing**: React Router v6 with protected routes
- **UI Components**: Headless UI for accessible components
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React Hot Toast for user feedback

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication-related components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── video/          # Video-related components
│   └── common/         # Shared/common components
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── ThemeContext.tsx# Theme state management
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── assets/             # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Backend API server running (see backend documentation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd videotube-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Links, buttons, accents
- **Secondary**: Gray scale for backgrounds and text
- **Success**: Green for positive actions
- **Warning**: Yellow for warnings
- **Error**: Red for errors and destructive actions

### Typography
- **Headings**: Inter font family with proper hierarchy
- **Body Text**: Optimized line height (150%) for readability
- **Code**: Monospace font for technical content

### Spacing
- **Base Unit**: 4px (0.25rem)
- **Consistent Scale**: 8px system (8px, 16px, 24px, 32px, etc.)

## 🔐 Authentication Flow

1. **Registration**: User creates account with username, email, full name, and password
2. **Login**: Email/password authentication returns access and refresh tokens
3. **Token Management**: Automatic token refresh using HTTP interceptors
4. **Protected Routes**: Automatic redirection for authenticated/unauthenticated users
5. **Logout**: Secure token cleanup and user state reset

## 📱 Responsive Design

- **Mobile**: < 768px - Stack layout, collapsible navigation
- **Tablet**: 768px - 1024px - Adaptive grid layouts
- **Desktop**: > 1024px - Full sidebar navigation, multi-column layouts

## 🎯 API Integration

The frontend integrates with a RESTful backend API with the following services:

- **Auth Service**: Registration, login, password management
- **Video Service**: CRUD operations, search, recommendations
- **Comment Service**: Comment management and interactions
- **Subscription Service**: Channel subscriptions and notifications

All API calls include:
- Automatic token authentication
- Error handling with user feedback
- Loading states and optimistic updates
- Request/response logging for debugging

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

### Deployment Platforms

The application can be deployed to:
- **Vercel**: Zero-configuration deployment
- **Netlify**: Static site hosting with serverless functions
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

## 🔍 Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: WebP format support and lazy loading
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Service worker for offline support (optional)

## 🧪 Testing

The project includes setup for testing with:
- **Unit Tests**: Jest and React Testing Library
- **E2E Tests**: Playwright or Cypress (configuration ready)
- **Type Checking**: TypeScript strict mode enabled

## 🛡️ Security Features

- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Token-based request validation
- **Input Validation**: Client and server-side validation
- **Secure Storage**: HTTPOnly cookies for sensitive data

## 📄 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review existing issues and discussions

---

Built with ❤️ using React, TypeScript, and modern web technologies.