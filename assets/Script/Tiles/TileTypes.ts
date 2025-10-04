/**
 * Типы и интерфейсы для системы тайлов
 */

import { TileType, TileState, Position } from "../Core/GameState";

export interface ITile {
    type: TileType;
    state: TileState;
    position: Position;
    isSpecial: boolean;
    specialType?: string;
}

export interface TileConfig {
    type: TileType;
    position: Position;
    isSpecial?: boolean;
    specialType?: string;
}
