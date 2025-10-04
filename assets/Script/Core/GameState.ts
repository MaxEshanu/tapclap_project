/**
 * Состояния игры и основные типы данных
 */

export enum GameState {
    MENU = "menu",
    PLAYING = "playing",
    PAUSED = "paused",
    GAME_OVER = "game_over",
    VICTORY = "victory"
}

export enum TileType {
    BLUE = "blue",
    GREEN = "green",
    RED = "red", 
    YELLOW = "yellow",
    PURPLE = "purple",
    SUPER_ROW = "super_row",
    SUPER_COLUMN = "super_column",
    SUPER_BOMB = "super_bomb", 
    SUPER_BOMB_MAX = "super_bomb_max"
}

export enum TileState {
    NORMAL = "normal",
    BURNING = "burning",
    FALLING = "falling",
    SPAWNING = "spawning"
}

export interface GameConfig {
    fieldWidth: number;
    fieldHeight: number;
    targetScore: number;
    maxMoves: number;
    shuffleAttempts: number;
}

export interface GameStats {
    score: number;
    moves: number;
    targetScore: number;
    maxMoves: number;
    shufflesLeft: number;
    isGameOver: boolean;
    isWin: boolean;
}

export interface Position {
    x: number;
    y: number;
}
