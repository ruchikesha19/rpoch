# FeedNet React Frontend

This is the React version of the FeedNet frontend, converted from the static HTML/CSS/JavaScript version while maintaining all functionality and design.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
react/
├── public/                 # Static files
│   ├── assets/            # Images and assets
│   └── index.html         # HTML template
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Header.js      # Navigation header
│   │   ├── ProtectedRoute.js # Route protection
│   │   └── Toast.js       # Toast notifications
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── pages/             # Page components
│   │   ├── Index.js       # Landing page
│   │   ├── Login.js       # Login selection
│   │   ├── Register.js    # Registration selection
│   │   ├── LoginVolunteer.js # Volunteer login
│   │   ├── LoginRestaurant.js # Restaurant login
│   │   ├── RegisterVolunteer.js # Volunteer registration
│   │   ├── RegisterRestaurant.js # Restaurant registration
│   │   ├── Volunteers.js  # Volunteer dashboard
│   │   ├── Restaurants.js # Restaurant dashboard
│   │   └── Community.js   # Community chat
│   ├── services/          # API services
│   │   └── api.js         # API configuration
│   ├── App.js             # Main app component
│   ├── App.css            # Global styles
│   ├── index.css          # Base styles
│   └── index.js           # Entry point
├── package.json
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## 🔧 Features

### ✅ Fully Converted from Static Version
- All original pages converted to React components
- Identical design and functionality
- Same user experience and interactions

### 🎯 Modern React Architecture
- **React 18** with hooks and functional components
- **React Router** for client-side routing
- **Context API** for state management
- **Axios** for API communication
- **Tailwind CSS** for styling (maintained from original)

### 🔐 Authentication System
- Multi-role authentication (Volunteer/Restaurant)
- Protected routes with role-based access
- Session management with localStorage
- JWT token handling

### 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Maintained original responsive breakpoints

### 🎨 UI Components
- Custom animations and transitions
- Interactive charts and data visualizations
- Toast notifications
- Form validation and error handling

## 🔗 Backend Integration

The React frontend is fully integrated with the Flask backend:

- **API Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT tokens with automatic header injection
- **Error Handling**: Global error interceptors
- **Proxy Configuration**: Development proxy to backend

### API Endpoints Used
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/health` - Health check

## 🛠️ Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎯 Key Differences from Static Version

### Improvements
- **Component-based architecture** for better maintainability
- **State management** with React hooks
- **Error boundaries** and better error handling
- **Code splitting** and lazy loading potential
- **TypeScript ready** structure
- **Modern JavaScript** (ES6+)

### Maintained Features
- **Exact same visual design**
- **All animations and transitions**
- **Form validation logic**
- **User flow and navigation**
- **Responsive behavior**
- **API integration**

## 🚀 Deployment

### Build and Deploy
```bash
npm run build
# Deploy the build/ folder to your hosting service
```

### Environment Setup
- Set `REACT_APP_API_URL` to your backend URL
- Configure CORS on your backend
- Ensure proper SSL certificates in production

## 🔧 Configuration

### Tailwind CSS
Custom configuration with FeedNet brand colors:
- Ocean blues (#1588d6, #15557d, #102f48)
- Mint greens (#22b887, #13765b)
- Coral accent (#ff7a59)
- Honey highlight (#f4b740)

### React Router
Protected routes with role-based access control:
- `/volunteers` - Volunteer only
- `/restaurants` - Restaurant only  
- `/community` - Both roles

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow the existing component structure
2. Use Tailwind CSS classes for styling
3. Maintain responsive design principles
4. Test API integrations thoroughly
5. Keep accessibility in mind

## 📄 License

This project maintains the same license as the original FeedNet application.
