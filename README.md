# 🎵 Mixtape AI - React App

A modern React application that uses AI to generate personalized music playlists. Users can describe their mood, occasion, or preferences, and the app will analyze the request and find matching songs from Spotify.

## Features

- **AI-Powered Playlist Generation**: Describe your mood and get personalized song recommendations
- **Spotify Integration**: Real-time song search and preview playback
- **Modern UI**: Beautiful, responsive design with glassmorphism effects
- **User Authentication**: Secure login/signup with JWT tokens
- **Music Player**: Built-in audio player with Spotify embeds
- **Queue Management**: Add/remove songs from your personal mixtape
- **AI Playlist Expansion**: Generate more songs based on your existing playlist

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- OpenAI API key
- Spotify API credentials (optional, uses demo credentials by default)

### Frontend Setup

1. Navigate to the React app directory:
```bash
cd mixtape-ai-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The React app will run on `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (create a `.env` file):
```bash
OPENAI_API_KEY=your_openai_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

5. Start the Flask backend:
```bash
python app.py
```

The backend API will run on `http://localhost:5000`

##  How to Use

1. **Sign Up/Login**: Create an account or sign in to access the app
2. **Generate Playlist**: Enter a description like "Chill pop songs for a rainy day" or "Upbeat workout music"
3. **AI Analysis**: The app will analyze your request and show mood, genre, and keywords
4. **Add Songs**: Click "Add to Queue" on recommended songs
5. **Play Music**: Use the built-in player to listen to your mixtape
6. **Expand Playlist**: Once you have 4+ songs, generate an AI playlist based on your existing songs

##  Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Styled Components**: CSS-in-JS styling
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Context API**: State management

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **OpenAI API**: AI-powered analysis
- **Spotify API**: Music search and metadata

### Database
- **SQLite**: Lightweight database (can be changed to PostgreSQL/MySQL)

##  Project Structure

```
mixtape-ai-react/
├── src/
│   ├── components/
│   │   ├── MixtapeGenerator.js    # Main app component
│   │   ├── MusicPlayer.js         # Audio player
│   │   ├── SongQueue.js           # Queue management
│   │   ├── Login.js              # Login form
│   │   └── Signup.js             # Signup form
│   ├── context/
│   │   └── AuthContext.js        # Authentication context
│   └── App.js                    # Main app component
├── backend/
│   ├── app.py                    # Flask backend
│   └── requirements.txt          # Python dependencies
└── README.md
```

##  Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
FLASK_SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
```

### API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/generate` - Generate playlist from prompt
- `POST /api/add_song` - Add song to queue
- `POST /api/remove_song` - Remove song from queue
- `GET /api/mixtape_queue` - Get user's mixtape queue
- `POST /api/generate_playlist_from_songs` - Generate AI playlist from existing songs

##  UI Features

- **Glassmorphism Design**: Modern glass-like UI elements
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Dark/Light Theme**: Gradient backgrounds and modern styling
- **Loading States**: Beautiful loading indicators
- **Error Handling**: User-friendly error messages

##  Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: SQLAlchemy ORM protection

##  Deployment

### Frontend Deployment

1. Build the production version:
```bash
npm run build
```

2. Deploy to your preferred hosting service (Netlify, Vercel, etc.)

### Backend Deployment

1. Set up a production server (Heroku, DigitalOcean, etc.)
2. Install Python dependencies
3. Set environment variables
4. Run with a production WSGI server like Gunicorn

### Screenshot
![MixTape-AI Screenshot](https://github.com/user-attachments/assets/d9f8f059-0ef2-4124-b77b-2da1a7d4447f)

##  Acknowledgments

- OpenAI for AI-powered analysis
- Spotify for music data and playback
- React and Flask communities for excellent documentation
- Styled Components for beautiful styling solutions

---

**Note**: This is a demo application. For production use, please:
- Use proper environment variables
- Set up a production database
- Configure proper CORS settings
- Add rate limiting
- Implement proper error logging
- Add comprehensive testing
