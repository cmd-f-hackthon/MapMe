# MapMe - cmd-f 2025 Hackathon Project



https://github.com/user-attachments/assets/6b0e914e-6a8a-4ed5-8650-8a4ec15bc3c7



## 👥 Team Members
- Eva
- Jenny
- Ruiyang
- Linda

## 🌟 Project Overview
Traditional methods of preserving memories often lack spatial context, making them less vivid. We wanted to address this by placing a focus on location-based journaling.

MapMe is a web application that allows users to journal their memories with an interactive mapping experience. It was built during the cmd-f 2025 hackathon.

## 🚀 Tech Stack
### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- Google Maps API
- Google OAuth 2.0 API

### Backend
- Node.js
- Express.js
- MongoDB
- RESTful API

### Testing
- Jest

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Google Maps API key
- Google OAuth Client ID

### Environment Variables

1. Frontend Setup (`frontend/.env.local`):
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<YOUR-API-KEY>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<YOUR-CLIENT-ID>
```

2. Backend Setup (`backend/.env`):
```
PORT=4000
MONGODB_URI=<your_mongodb_connection_string>
GOOGLE_MAPS_API_KEY=<YOUR-API-KEY>
```

### Installation & Running

1. Backend Setup:
```bash
cd backend
npm install
node src/index.js
```

2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

3. Testing Setup:
```bash
cd tests
npm install
npm test
```

## 🌈 Features
- Interactive map interface
- Journal data storage
- User authentication
- Real-time location updates
- Responsive design

 
 
 
 
