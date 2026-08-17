from pathlib import Path
import os
import re
import secrets
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database.db"

# ------------------------------------------------------------
# Development settings
# ------------------------------------------------------------

# Keep this TRUE while you are testing the game locally.
#
# Before publishing publicly, change it to FALSE or set the
# environment variable:
#
#   CHARLIE_ENABLE_DEV_XP=false
#
ENABLE_DEV_XP_ENDPOINT = (
    os.getenv("CHARLIE_ENABLE_DEV_XP", "true").strip().lower()
    == "true"
)

# ------------------------------------------------------------
# CORS
# ------------------------------------------------------------
#
# Local development:
#   http://127.0.0.1:5500
#   http://localhost:5500
#   http://127.0.0.1:8000
#   http://localhost:8000
#
# For production, set:
#
#   CHARLIE_CORS_ORIGINS=https://your-domain.com
#
# Multiple origins can be separated with commas.
#

DEFAULT_CORS_ORIGINS = (
    "http://127.0.0.1:5500,"
    "http://localhost:5500,"
    "http://127.0.0.1:8000,"
    "http://localhost:8000"
)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CHARLIE_CORS_ORIGINS",
        DEFAULT_CORS_ORIGINS,
    ).split(",")
    if origin.strip()
]


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


# ============================================================
# DATABASE
# ============================================================

def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10,
    )

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database() -> None:
    connection = get_connection()

    try:
        # ----------------------------------------------------
        # Players table
        # ----------------------------------------------------

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                xp INTEGER NOT NULL DEFAULT 0,
                achievements INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        connection.commit()

        # ----------------------------------------------------
        # Upgrade older databases automatically
        # ----------------------------------------------------

        existing_columns = {
            row["name"]
            for row in connection.execute(
                "PRAGMA table_info(players)"
            ).fetchall()
        }

        if "level" not in existing_columns:
            connection.execute(
                """
                ALTER TABLE players
                ADD COLUMN level INTEGER NOT NULL DEFAULT 1
                """
            )

        if "xp" not in existing_columns:
            connection.execute(
                """
                ALTER TABLE players
                ADD COLUMN xp INTEGER NOT NULL DEFAULT 0
                """
            )

        if "achievements" not in existing_columns:
            connection.execute(
                """
                ALTER TABLE players
                ADD COLUMN achievements INTEGER NOT NULL DEFAULT 0
                """
            )

        connection.commit()

        # ----------------------------------------------------
        # Game sessions table
        # ----------------------------------------------------

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS game_sessions (
                id TEXT PRIMARY KEY,
                player_id INTEGER NOT NULL,
                started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ended_at TEXT,
                score INTEGER,
                submitted INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (player_id)
                    REFERENCES players(id)
            )
            """
        )

        connection.commit()

    finally:
        connection.close()


# ============================================================
# FASTAPI LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once when the application starts.
    Replaces the deprecated @app.on_event("startup").
    """

    initialize_database()

    yield


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Charlie's Game API",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class RegisterRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=20,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


class AddXPRequest(BaseModel):
    amount: int = Field(
        gt=0,
        le=100000,
    )


class StartGameRequest(BaseModel):
    player_id: int = Field(
        gt=0,
    )


class SubmitScoreRequest(BaseModel):
    session_id: str = Field(
        min_length=20,
        max_length=200,
    )

    score: int = Field(
        ge=0,
        le=1000000,
    )


# ============================================================
# VALIDATION HELPERS
# ============================================================

def validate_username(username: str) -> str:
    username = username.strip()

    if len(username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Username must contain at least 3 characters.",
        )

    if len(username) > 20:
        raise HTTPException(
            status_code=400,
            detail="Username must not exceed 20 characters.",
        )

    if not re.fullmatch(
        r"[A-Za-z0-9_-]+",
        username,
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Username may only contain letters, "
                "numbers, underscores and hyphens."
            ),
        )

    return username


def validate_password(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )

    if len(password) > 128:
        raise HTTPException(
            status_code=400,
            detail="Password must not exceed 128 characters.",
        )


def sanitize_email(email: str) -> str:
    return str(email).strip().lower()


# ============================================================
# XP / LEVEL SYSTEM
# ============================================================

def calculate_level(total_xp: int) -> int:
    """
    Level 1 starts at 0 XP.

    Every 100 XP advances one level.

    Examples:
        0 XP   -> Level 1
        99 XP  -> Level 1
        100 XP -> Level 2
        250 XP -> Level 3
    """

    if total_xp < 0:
        total_xp = 0

    return (total_xp // 100) + 1


def calculate_achievement_count(current_xp: int) -> int:
    """
    Temporary achievement calculation.

    Every 500 XP counts as one achievement.
    """

    if current_xp < 0:
        current_xp = 0

    return current_xp // 500


def calculate_xp_from_score(score: int) -> int:
    """
    Temporary scoring rule:

        Every 10 score points = 1 XP

    Maximum XP awarded from one game session:
        1000 XP
    """

    if score < 0:
        score = 0

    return min(
        score // 10,
        1000,
    )


# ============================================================
# PLAYER HELPERS
# ============================================================

def get_player_stats(
    connection: sqlite3.Connection,
    player_id: int,
):
    return connection.execute(
        """
        SELECT
            id,
            username,
            email,
            level,
            xp,
            achievements,
            created_at
        FROM players
        WHERE id = ?
        LIMIT 1
        """,
        (player_id,),
    ).fetchone()


def get_public_player_stats(
    connection: sqlite3.Connection,
    player_id: int,
):
    """
    Returns public-safe player information.

    Email is intentionally excluded from this helper.
    """

    return connection.execute(
        """
        SELECT
            id,
            username,
            level,
            xp,
            achievements,
            created_at
        FROM players
        WHERE id = ?
        LIMIT 1
        """,
        (player_id,),
    ).fetchone()


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Charlie's Game API is running!",
        "status": "online",
    }


@app.get("/api/status")
def status():
    return {
        "game": "Charlie's Game",
        "server": "online",
        "version": "1.0.0",
        "environment": "development"
        if ENABLE_DEV_XP_ENDPOINT
        else "production",
    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/api/register")
def register_player(request: RegisterRequest):

    username = validate_username(
        request.username
    )

    email = sanitize_email(
        request.email
    )

    validate_password(
        request.password
    )

    hashed_password = password_hash.hash(
        request.password
    )

    connection = get_connection()

    try:

        existing = connection.execute(
            """
            SELECT id
            FROM players
            WHERE username = ?
               OR email = ?
            LIMIT 1
            """,
            (
                username,
                email,
            ),
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=409,
                detail=(
                    "An account with that username "
                    "or email already exists."
                ),
            )

        cursor = connection.execute(
            """
            INSERT INTO players (
                username,
                email,
                password_hash,
                level,
                xp,
                achievements
            )
            VALUES (?, ?, ?, 1, 0, 0)
            """,
            (
                username,
                email,
                hashed_password,
            ),
        )

        connection.commit()

        player_id = cursor.lastrowid

        player = get_player_stats(
            connection,
            player_id,
        )

        return {
            "success": True,
            "message": "Account created successfully!",
            "player": dict(player),
        }

    except sqlite3.IntegrityError:
        connection.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with that username "
                "or email already exists."
            ),
        )

    finally:
        connection.close()


# ============================================================
# LOGIN
# ============================================================

@app.post("/api/login")
def login_player(request: LoginRequest):

    email = sanitize_email(
        request.email
    )

    connection = get_connection()

    try:

        player = connection.execute(
            """
            SELECT
                id,
                username,
                email,
                password_hash,
                level,
                xp,
                achievements,
                created_at
            FROM players
            WHERE email = ?
            LIMIT 1
            """,
            (email,),
        ).fetchone()

        if player is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

        valid_password = password_hash.verify(
            request.password,
            player["password_hash"],
        )

        if not valid_password:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

        return {
            "success": True,
            "message": "Login successful!",
            "player": {
                "id": player["id"],
                "username": player["username"],
                "email": player["email"],
                "level": player["level"],
                "xp": player["xp"],
                "achievements": player["achievements"],
                "created_at": player["created_at"],
            },
        }

    finally:
        connection.close()


# ============================================================
# PLAYER PROFILE
# ============================================================

@app.get("/api/player/{player_id}")
def get_player(player_id: int):

    if player_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid player ID.",
        )

    connection = get_connection()

    try:

        player = get_public_player_stats(
            connection,
            player_id,
        )

        if player is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found.",
            )

        return {
            "success": True,
            "player": dict(player),
        }

    finally:
        connection.close()


# ============================================================
# DEVELOPMENT XP ENDPOINT
# ============================================================

@app.post("/api/player/{player_id}/xp")
def add_player_xp(
    player_id: int,
    request: AddXPRequest,
):
    """
    Development/testing endpoint.

    IMPORTANT:
    This endpoint should be disabled before public deployment.

    Set:

        CHARLIE_ENABLE_DEV_XP=false

    when publishing the game.
    """

    if not ENABLE_DEV_XP_ENDPOINT:
        raise HTTPException(
            status_code=404,
            detail="Endpoint not available.",
        )

    if player_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid player ID.",
        )

    if request.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="XP amount must be greater than zero.",
        )

    connection = get_connection()

    try:

        player = get_player_stats(
            connection,
            player_id,
        )

        if player is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found.",
            )

        new_xp = (
            player["xp"]
            + request.amount
        )

        new_level = calculate_level(
            new_xp
        )

        new_achievements = calculate_achievement_count(
            new_xp
        )

        connection.execute(
            """
            UPDATE players
            SET
                xp = ?,
                level = ?,
                achievements = ?
            WHERE id = ?
            """,
            (
                new_xp,
                new_level,
                new_achievements,
                player_id,
            ),
        )

        connection.commit()

        updated_player = get_player_stats(
            connection,
            player_id,
        )

        return {
            "success": True,
            "message": "XP added successfully!",
            "player": dict(updated_player),
        }

    finally:
        connection.close()


# ============================================================
# GAME SESSION START
# ============================================================

@app.post("/api/game/start")
def start_game(request: StartGameRequest):
    """
    Creates a one-time game session for a player.

    The frontend currently supplies player_id.
    Authentication can be strengthened later without
    changing the database structure.
    """

    if request.player_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid player ID.",
        )

    connection = get_connection()

    try:

        player = get_public_player_stats(
            connection,
            request.player_id,
        )

        if player is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found.",
            )

        session_id = secrets.token_urlsafe(
            32
        )

        connection.execute(
            """
            INSERT INTO game_sessions (
                id,
                player_id
            )
            VALUES (?, ?)
            """,
            (
                session_id,
                request.player_id,
            ),
        )

        connection.commit()

        return {
            "success": True,
            "message": "Game session started.",
            "session_id": session_id,
            "player_id": request.player_id,
        }

    finally:
        connection.close()


# ============================================================
# SCORE SUBMISSION
# ============================================================

@app.post("/api/game/submit-score")
def submit_game_score(
    request: SubmitScoreRequest,
):
    """
    Submit one final score for a previously
    created game session.
    """

    score = request.score

    if score < 0:
        raise HTTPException(
            status_code=400,
            detail="Score cannot be negative.",
        )

    if score > 1000000:
        raise HTTPException(
            status_code=400,
            detail="Score is too large.",
        )

    connection = get_connection()

    try:

        # ----------------------------------------------------
        # Get game session
        # ----------------------------------------------------

        session = connection.execute(
            """
            SELECT
                id,
                player_id,
                submitted
            FROM game_sessions
            WHERE id = ?
            LIMIT 1
            """,
            (request.session_id,),
        ).fetchone()

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Game session not found.",
            )

        if session["submitted"]:
            raise HTTPException(
                status_code=409,
                detail=(
                    "This game session has already "
                    "submitted a score."
                ),
            )

        # ----------------------------------------------------
        # Get player
        # ----------------------------------------------------

        player = get_player_stats(
            connection,
            session["player_id"],
        )

        if player is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found.",
            )

        # ----------------------------------------------------
        # Calculate XP on the server
        # ----------------------------------------------------

        awarded_xp = calculate_xp_from_score(
            score
        )

        new_xp = (
            player["xp"]
            + awarded_xp
        )

        new_level = calculate_level(
            new_xp
        )

        new_achievements = (
            calculate_achievement_count(
                new_xp
            )
        )

        # ----------------------------------------------------
        # Update player
        # ----------------------------------------------------

        connection.execute(
            """
            UPDATE players
            SET
                xp = ?,
                level = ?,
                achievements = ?
            WHERE id = ?
            """,
            (
                new_xp,
                new_level,
                new_achievements,
                session["player_id"],
            ),
        )

        # ----------------------------------------------------
        # Complete game session
        # ----------------------------------------------------

        cursor = connection.execute(
            """
            UPDATE game_sessions
            SET
                ended_at = CURRENT_TIMESTAMP,
                score = ?,
                submitted = 1
            WHERE
                id = ?
                AND submitted = 0
            """,
            (
                score,
                request.session_id,
            ),
        )

        # ----------------------------------------------------
        # Extra protection against duplicate submission
        # ----------------------------------------------------

        if cursor.rowcount != 1:
            connection.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "This game session has already "
                    "been submitted."
                ),
            )

        connection.commit()

        # ----------------------------------------------------
        # Return updated player
        # ----------------------------------------------------

        updated_player = get_player_stats(
            connection,
            session["player_id"],
        )

        return {
            "success": True,
            "message": "Score submitted successfully!",
            "score": score,
            "awarded_xp": awarded_xp,
            "player": dict(updated_player),
        }

    finally:
        connection.close()


# ============================================================
# LEADERBOARD
# ============================================================

@app.get("/api/leaderboard")
def leaderboard():

    connection = get_connection()

    try:

        players = connection.execute(
            """
            SELECT
                id,
                username,
                level,
                xp,
                achievements
            FROM players
            ORDER BY
                xp DESC,
                level DESC,
                username ASC
            LIMIT 100
            """
        ).fetchall()

        result = []

        for position, player in enumerate(
            players,
            start=1,
        ):
            result.append(
                {
                    "rank": position,
                    "id": player["id"],
                    "username": player["username"],
                    "level": player["level"],
                    "xp": player["xp"],
                    "achievements": player["achievements"],
                }
            )

        return {
            "success": True,
            "players": result,
        }

    finally:
        connection.close()
