from pathlib import Path
import os
import re
import secrets
import sqlite3
from contextlib import asynccontextmanager

import psycopg
from psycopg.rows import dict_row

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATABASE_PATH = BASE_DIR / "database.db"

# When DATABASE_URL exists, PostgreSQL is used.
# When it does not exist, SQLite is used.
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

USE_POSTGRES = bool(DATABASE_URL)


# ============================================================
# DEVELOPMENT XP CONFIGURATION
# ============================================================

ENABLE_DEV_XP_ENDPOINT = (
    os.getenv(
        "CHARLIE_ENABLE_DEV_XP",
        "true",
    )
    .strip()
    .lower()
    == "true"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

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
# DATABASE CONNECTION
# ============================================================

def get_connection():
    """
    Returns either:

        SQLite connection
    or:
        PostgreSQL connection

    depending on whether DATABASE_URL exists.
    """

    if USE_POSTGRES:
        return psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row,
            connect_timeout=10,
        )

    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10,
    )

    connection.row_factory = sqlite3.Row

    # Make sure foreign keys are enforced in SQLite.
    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    return connection


def execute_query(
    connection,
    query: str,
    params=(),
):
    """
    Execute a query using syntax compatible with
    both SQLite (?) and PostgreSQL (%s).

    Our application SQL uses ? placeholders.
    They are converted automatically for PostgreSQL.
    """

    if USE_POSTGRES:
        query = query.replace(
            "?",
            "%s",
        )

    return connection.execute(
        query,
        params,
    )


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def initialize_sqlite_database() -> None:
    connection = get_connection()

    try:
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


def initialize_postgres_database() -> None:
    connection = get_connection()

    try:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS players (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                level INTEGER NOT NULL DEFAULT 1,
                xp INTEGER NOT NULL DEFAULT 0,
                achievements INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        connection.execute(
            """
            ALTER TABLE players
            ADD COLUMN IF NOT EXISTS level
            INTEGER NOT NULL DEFAULT 1
            """
        )

        connection.execute(
            """
            ALTER TABLE players
            ADD COLUMN IF NOT EXISTS xp
            INTEGER NOT NULL DEFAULT 0
            """
        )

        connection.execute(
            """
            ALTER TABLE players
            ADD COLUMN IF NOT EXISTS achievements
            INTEGER NOT NULL DEFAULT 0
            """
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS game_sessions (
                id TEXT PRIMARY KEY,
                player_id INTEGER NOT NULL,
                started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                score INTEGER,
                submitted BOOLEAN NOT NULL DEFAULT FALSE,
                FOREIGN KEY (player_id)
                    REFERENCES players(id)
            )
            """
        )

        connection.commit()

    finally:
        connection.close()


def initialize_database() -> None:
    """
    Initialize whichever database the application is using.
    """

    if USE_POSTGRES:
        initialize_postgres_database()
    else:
        initialize_sqlite_database()


# ============================================================
# FASTAPI LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()

    print(
        "Database:",
        "PostgreSQL"
        if USE_POSTGRES
        else "SQLite",
    )

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
    allow_methods=[
        "GET",
        "POST",
        "OPTIONS",
    ],
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


# ============================================================
# NAMED ACHIEVEMENT BADGES
# ============================================================


# ============================================================
# ACHIEVEMENT DEFINITIONS
# ============================================================

ACHIEVEMENT_BADGE_DEFINITIONS = {
    "first_blood": {
        "title": "First Blood",
        "description": "Complete your first game.",
        "icon": "\U0001F3C6",
        "rarity": "COMMON",
        "target": 1,
        "metric": "games",
    },
    "rising_star": {
        "title": "Rising Star",
        "description": "Reach Level 5.",
        "icon": "\u26A1",
        "rarity": "RARE",
        "target": 5,
        "metric": "level",
    },
    "club_1k": {
        "title": "1K Club",
        "description": "Reach 1,000 XP.",
        "icon": "\U0001F525",
        "rarity": "EPIC",
        "target": 1000,
        "metric": "xp",
    },
    "veteran": {
        "title": "Veteran",
        "description": "Reach Level 10.",
        "icon": "\U0001F451",
        "rarity": "LEGENDARY",
        "target": 10,
        "metric": "level",
    },
}


def get_submitted_game_count(
    connection,
    player_id: int,
) -> int:
    row = execute_query(
        connection,
        """
        SELECT COUNT(*) AS count
        FROM game_sessions
        WHERE player_id = ?
          AND submitted = ?
        """,
        (
            player_id,
            False if USE_POSTGRES else 1,
        ),
    ).fetchone()

    if row is None:
        return 0

    return int(row["count"] or 0)


def get_achievement_badges(
    connection,
    player_id: int,
    player,
):
    xp = max(
        0,
        int(player["xp"] or 0),
    )

    level = max(
        1,
        int(player["level"] or 1),
    )

    submitted_games = get_submitted_game_count(
        connection,
        player_id,
    )

    metrics = {
        "games": submitted_games,
        "level": level,
        "xp": xp,
    }

    badges = []

    for achievement_key, definition in (
        ACHIEVEMENT_BADGE_DEFINITIONS.items()
    ):
        target = max(
            1,
            int(definition["target"]),
        )

        current = max(
            0,
            int(metrics[definition["metric"]]),
        )

        unlocked = current >= target

        progress_percent = int(
            min(
                100,
                max(
                    0,
                    (current * 100) // target,
                ),
            )
        )

        badges.append(
            {
                "achievement_key": achievement_key,
                "title": definition["title"],
                "description": definition["description"],
                "icon": definition["icon"],
                "rarity": definition["rarity"],
                "current": current,
                "target": target,
                "progress_percent": progress_percent,
                "unlocked": unlocked,
            }
        )

    return badges
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


def calculate_achievement_count(
    connection=None,
    player_id=None,
    player=None,
) -> int:
    """
    Return the number of currently unlocked named achievements.

    The optional one-argument compatibility path preserves the
    old 500-XP counter if any legacy code still calls this function
    with only total XP.
    """

    # ---------------------------------------------------------
    # Legacy compatibility:
    # calculate_achievement_count(total_xp)
    # ---------------------------------------------------------

    if (
        player is None
        and player_id is None
        and (
            isinstance(connection, int)
            or isinstance(connection, float)
        )
    ):
        total_xp = max(
            0,
            int(connection),
        )

        return total_xp // 500

    # ---------------------------------------------------------
    # New achievement system
    # ---------------------------------------------------------

    if connection is None or player_id is None or player is None:
        return 0

    badges = get_achievement_badges(
        connection,
        player_id,
        player,
    )

    return sum(
        1
        for badge in badges
        if badge.get("unlocked") is True
    )


def calculate_xp_from_score(
    score: int,
) -> int:
    """
    Temporary scoring rule:

        every 10 score points = 1 XP

    Maximum XP from a single game:
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
    connection,
    player_id: int,
):
    return execute_query(
        connection,
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
    connection,
    player_id: int,
):
    return execute_query(
        connection,
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
        "database": (
            "postgresql"
            if USE_POSTGRES
            else "sqlite"
        ),
        "environment": (
            "production"
            if USE_POSTGRES
            else "development"
        ),
    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/api/register")
def register_player(
    request: RegisterRequest,
):
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
        existing = execute_query(
            connection,
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

        if USE_POSTGRES:
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
                VALUES (
                    %s,
                    %s,
                    %s,
                    1,
                    0,
                    0
                )
                RETURNING id
                """,
                (
                    username,
                    email,
                    hashed_password,
                ),
            )

            player_id = cursor.fetchone()["id"]

        else:
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

            player_id = cursor.lastrowid

        connection.commit()

        player = get_player_stats(
            connection,
            player_id,
        )

        return {
            "success": True,
            "message": "Account created successfully!",
            "player": dict(player),
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to create account.",
        )

    finally:
        connection.close()


# ============================================================
# LOGIN
# ============================================================

@app.post("/api/login")
def login_player(
    request: LoginRequest,
):
    email = sanitize_email(
        request.email
    )

    connection = get_connection()

    try:
        player = execute_query(
            connection,
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

        achievement_badges = get_achievement_badges(
            connection,
            player["id"],
            player,
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
                "achievement_badges": achievement_badges,
            },
        }

    finally:
        connection.close()


# ============================================================
# PLAYER PROFILE
# ============================================================

@app.get("/api/player/{player_id}")
def get_player(
    player_id: int,
):
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

        achievement_badges = get_achievement_badges(
            connection,
            player_id,
            player,
        )

        return {
            "success": True,
            "player": {
                **dict(player),
                "achievement_badges": achievement_badges,
            },
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

    Keep this enabled locally.

    Before public deployment:

        CHARLIE_ENABLE_DEV_XP=false
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

        projected_player = dict(player)
        projected_player["xp"] = new_xp
        projected_player["level"] = new_level

        new_achievements = calculate_achievement_count(
            connection,
            player_id,
            projected_player,
        )

        execute_query(
            connection,
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

        achievement_badges = get_achievement_badges(
            connection,
            player_id,
            updated_player,
        )

        return {
            "success": True,
            "message": "XP added successfully!",
            "player": {
                **dict(updated_player),
                "achievement_badges": achievement_badges,
            },
        }

    finally:
        connection.close()


# ============================================================
# GAME SESSION START
# ============================================================

@app.post("/api/game/start")
def start_game(
    request: StartGameRequest,
):
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

        execute_query(
            connection,
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
        session = execute_query(
            connection,
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

        player = get_player_stats(
            connection,
            session["player_id"],
        )

        if player is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found.",
            )

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

        projected_player = dict(player)
        projected_player["xp"] = new_xp
        projected_player["level"] = new_level

        new_achievements = calculate_achievement_count(
            connection,
            session["player_id"],
            projected_player,
        )

        execute_query(
            connection,
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

        cursor = execute_query(
            connection,
            """
            UPDATE game_sessions
            SET
                ended_at = CURRENT_TIMESTAMP,
                score = ?,
                submitted = ?
            WHERE
                id = ?
                AND submitted = ?
            """,
            (
                score,
                False if USE_POSTGRES else 1,
                request.session_id,
                False if USE_POSTGRES else 0,
            ),
        )

        if cursor.rowcount != 1:
            connection.rollback()

            raise HTTPException(
                status_code=409,
                detail=(
                    "This game session has already "
                    "been submitted."
                ),
            )

        # For PostgreSQL the Python value must be boolean.
        if USE_POSTGRES:
            execute_query(
                connection,
                """
                UPDATE game_sessions
                SET submitted = TRUE
                WHERE id = ?
                """,
                (request.session_id,),
            )

        connection.commit()

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

    except HTTPException:
        connection.rollback()
        raise

    finally:
        connection.close()


# ============================================================
# LEADERBOARD
# ============================================================

@app.get("/api/leaderboard")
def leaderboard():
    connection = get_connection()

    try:
        players = execute_query(
            connection,
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
            """,
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
