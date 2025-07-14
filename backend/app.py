from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
import openai
import requests
import base64
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mixtape.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-super-secret-jwt-key-2024'  # Use a consistent key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Content-Type", "Authorization"])

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '9f3d073df3f848888fa35a80a7edd100')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '5c9743746c534982ba7e66a5ebd7e17a')

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, username, email, password_hash):
        self.username = username
        self.email = email
        self.password_hash = password_hash

class MixtapeSong(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    spotify_track_id = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(200), nullable=False)
    spotify_uri = db.Column(db.String(200), nullable=False)
    preview_url = db.Column(db.String(500))
    album_art_url = db.Column(db.String(500))
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, user_id, spotify_track_id, title, artist, spotify_uri, preview_url=None, album_art_url=None):
        self.user_id = user_id
        self.spotify_track_id = spotify_track_id
        self.title = title
        self.artist = artist
        self.spotify_uri = spotify_uri
        self.preview_url = preview_url
        self.album_art_url = album_art_url

# Spotify API functions
_spotify_token = None

def get_spotify_token():
    global _spotify_token
    if _spotify_token:
        return _spotify_token
    
    auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()
    headers = {
        "Authorization": f"Basic {b64_auth_str}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    resp = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    
    if resp.status_code == 200:
        _spotify_token = resp.json()["access_token"]
        return _spotify_token
    else:
        print("Spotify token error:", resp.text)
        return None

def search_spotify_tracks(keywords):
    print(f"[DEBUG] search_spotify_tracks called with: {keywords}", flush=True)
    token = get_spotify_token()
    if not token:
        print("[DEBUG] No Spotify token available.", flush=True)
        return []
    
    query = " ".join(keywords)
    print(f"[DEBUG] Spotify search query: '{query}' (keywords: {keywords})", flush=True)
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"q": query, "type": "track", "limit": 5}
    resp = requests.get(url, headers=headers, params=params)
    print(f"[DEBUG] Spotify search status: {resp.status_code}", flush=True)
    if resp.status_code != 200:
        print("[DEBUG] Spotify search error:", resp.text, flush=True)
        return []
    
    results = resp.json()
    tracks = []
    for item in results.get("tracks", {}).get("items", []):
        tracks.append({
            "title": item["name"],
            "artist": item["artists"][0]["name"] if item["artists"] else "",
            "album": item["album"]["name"] if item.get("album") else "",
            "spotify_track_id": item["id"],
            "spotify_uri": item["uri"],
            "preview_url": item["preview_url"],
            "album_art_url": item["album"]["images"][0]["url"] if item.get("album") and item["album"].get("images") else None
        })
    print(f"[DEBUG] Spotify tracks found: {len(tracks)}", flush=True)
    return tracks

# AI Analysis function
def analyze_prompt(prompt):
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a music assistant. Return JSON with mood, language, genre, keywords from a mixtape prompt. Be precise and avoid assumptions. Format:\n{\n  \"mood\": \"\",\n  \"language\": \"\",\n  \"genre\": \"\",\n  \"keywords\": [\"\", \"\"]\n}"
                },
                {
                    "role": "user",
                    "content": f"I want a mixtape for this: '{prompt}'"
                }
            ],
            temperature=0.6
        )
        
        content = response.choices[0].message.content
        if content is None:
            return {"error": "No content received from OpenAI"}
        return json.loads(content)
    except Exception as e:
        print("OpenAI Error:", e)
        return {"error": str(e)}

# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({"error": "All fields are required"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(identity=user.id)
    return jsonify({
        "token": token,
        "user": {"id": user.id, "username": user.username, "email": user.email}
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    token = create_access_token(identity=user.id)
    return jsonify({
        "token": token,
        "user": {"id": user.id, "username": user.username, "email": user.email}
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "user": {"id": user.id, "username": user.username, "email": user.email}
    })
@app.route('/api/generate', methods=['POST'])
@jwt_required()
def generate():
    print("[DEBUG] /api/generate called", flush=True)
    try:
        user_id = get_jwt_identity()
        print(f"[DEBUG] User ID from JWT: {user_id}", flush=True)
        data = request.get_json()
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        try:
            analysis = analyze_prompt(prompt)
            print(f"[DEBUG] analysis: {analysis}", flush=True)
            print(f"[DEBUG] keywords: {analysis.get('keywords', [])}", flush=True)
            spotify_results = search_spotify_tracks(analysis.get('keywords', []))
            
            return jsonify({
                "analysis": analysis,
                "spotify_results": spotify_results,
                "prompt": prompt
            })
        except Exception as e:
            print(f"[DEBUG] Error in generate: {e}", flush=True)
            return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"[DEBUG] JWT Error in generate: {e}", flush=True)
        return jsonify({"error": str(e)}), 401

@app.route('/api/add_song', methods=['POST'])
@jwt_required()
def add_song():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    spotify_track_id = data.get('spotify_track_id')
    title = data.get('title')
    artist = data.get('artist')
    spotify_uri = data.get('spotify_uri')
    preview_url = data.get('preview_url')
    album_art_url = data.get('album_art_url')
    
    if not all([spotify_track_id, title, artist, spotify_uri]):
        return jsonify({"error": "Missing required song data"}), 400
    
    existing = MixtapeSong.query.filter_by(user_id=user_id, spotify_track_id=spotify_track_id).first()
    if existing:
        return jsonify({"error": "Song already in mixtape"}), 400
    
    new_song = MixtapeSong(
        user_id=user_id,
        spotify_track_id=spotify_track_id,
        title=title,
        artist=artist,
        spotify_uri=spotify_uri,
        preview_url=preview_url,
        album_art_url=album_art_url
    )
    db.session.add(new_song)
    db.session.commit()
    
    return jsonify({"success": True})

@app.route('/api/remove_song', methods=['POST'])
@jwt_required()
def remove_song():
    user_id = get_jwt_identity()
    data = request.get_json()
    spotify_track_id = data.get('spotify_track_id')
    
    if not spotify_track_id:
        return jsonify({"error": "Spotify track ID is required"}), 400
    
    song = MixtapeSong.query.filter_by(user_id=user_id, spotify_track_id=spotify_track_id).first()
    if song:
        db.session.delete(song)
        db.session.commit()
        return jsonify({"success": True})
    
    return jsonify({"error": "Song not found"}), 404

@app.route('/api/mixtape_queue', methods=['GET'])
@jwt_required()
def get_mixtape_queue():
    print("[DEBUG] /api/mixtape_queue called", flush=True)
    try:
        user_id = get_jwt_identity()
        print(f"[DEBUG] User ID from JWT: {user_id}", flush=True)
        songs = MixtapeSong.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            "queue": [{
                "spotify_track_id": song.spotify_track_id,
                "title": song.title,
                "artist": song.artist,
                "spotify_uri": song.spotify_uri,
                "preview_url": song.preview_url,
                "album_art_url": song.album_art_url
            } for song in songs]
        })
    except Exception as e:
        print(f"[DEBUG] JWT Error in mixtape_queue: {e}", flush=True)
        return jsonify({"error": str(e)}), 401

@app.route('/api/generate_playlist_from_songs', methods=['POST'])
@jwt_required()
def generate_playlist_from_songs():
    user_id = get_jwt_identity()
    data = request.get_json()
    songs = data.get('songs', [])
    
    if len(songs) < 4:
        return jsonify({"error": "At least 4 songs are required"}), 400
    
    try:
        song_list = "\n".join([f"{s['title']} by {s['artist']}" for s in songs])
        prompt = (
            "Given the following songs, generate a playlist of 10 songs that match the vibe, genre, and mood. "
            "Return a JSON array of objects with 'title' and 'artist'. Songs should be diverse but fit the same mood.\n"
            f"Songs:\n{song_list}\nPlaylist:"
        )
        
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a music playlist generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        if content is None:
            return jsonify({"error": "No content received from OpenAI"}), 500
        import re
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            playlist = json.loads(match.group(0))
        else:
            playlist = json.loads(content)
        
        existing_titles = set((s['title'].lower(), s['artist'].lower()) for s in songs)
        added = []
        not_found = []
        
        for song in playlist:
            key = (song['title'].strip().lower(), song['artist'].strip().lower())
            if key not in existing_titles:
                results = search_spotify_tracks([song['title'], song['artist']])
                if not results:
                    results = search_spotify_tracks([song['title']])
                
                best_match = None
                best_score = 0.0
                for track in results or []:
                    from difflib import SequenceMatcher
                    score = SequenceMatcher(None, track['title'].lower(), song['title'].strip().lower()).ratio()
                    if score > best_score:
                        best_score = score
                        best_match = track
                
                if best_match and best_score > 0.6:
                    exists = MixtapeSong.query.filter_by(user_id=user_id, spotify_track_id=best_match['spotify_track_id']).first()
                    if not exists:
                        new_song = MixtapeSong(
                            user_id=user_id,
                            spotify_track_id=best_match['spotify_track_id'],
                            title=best_match['title'],
                            artist=best_match['artist'],
                            spotify_uri=best_match['spotify_uri'],
                            preview_url=best_match['preview_url'],
                            album_art_url=best_match.get('album_art_url')
                        )
                        db.session.add(new_song)
                        db.session.commit()
                        added.append({
                            'spotify_track_id': best_match['spotify_track_id'],
                            'title': best_match['title'],
                            'artist': best_match['artist'],
                            'spotify_uri': best_match['spotify_uri'],
                            'preview_url': best_match['preview_url'],
                            'album_art_url': best_match.get('album_art_url')
                        })
                else:
                    not_found.append(song)
        
        user_songs = MixtapeSong.query.filter_by(user_id=user_id).all()
        mixtape_queue = [{
            'spotify_track_id': s.spotify_track_id,
            'title': s.title,
            'artist': s.artist,
            'spotify_uri': s.spotify_uri,
            'preview_url': s.preview_url,
            'album_art_url': s.album_art_url
        } for s in user_songs]
        
        return jsonify({
            "added": added, 
            "not_found": not_found, 
            "mixtape_queue": mixtape_queue
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"[DEBUG] JWT Token expired: {jwt_payload}", flush=True)
    return jsonify({"error": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"[DEBUG] JWT Invalid token error: {error}", flush=True)
    print(f"[DEBUG] Request headers: {dict(request.headers)}", flush=True)
    return jsonify({"error": "Invalid token"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"[DEBUG] JWT Missing token error: {error}", flush=True)
    print(f"[DEBUG] Request headers: {dict(request.headers)}", flush=True)
    return jsonify({"error": "Missing authorization token"}), 401

@jwt.needs_fresh_token_loader
def token_not_fresh_callback(jwt_header, jwt_payload):
    print(f"[DEBUG] JWT Token not fresh: {jwt_payload}", flush=True)
    return jsonify({"error": "Token is not fresh"}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    print(f"[DEBUG] JWT Token revoked: {jwt_payload}", flush=True)
    return jsonify({"error": "Token has been revoked"}), 401

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5050) 