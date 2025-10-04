/**
 * Фабрика для создания тайлов с рандомными типами
 */

import { TileType, Position } from "../Core/GameState";
import { TileConfig } from "./TileTypes";

export class TileFactory {
    private static tileTypes: TileType[] = [
        TileType.BLUE,
        TileType.GREEN,
        TileType.RED,
        TileType.YELLOW,
        TileType.PURPLE
    ];

    public static createRandomTile(position: Position): TileConfig {
        const randomType = this.getRandomTileType();
        return {
            type: randomType,
            position: position,
            isSpecial: false
        };
    }

    public static createTileOfType(type: TileType, position: Position): TileConfig {
        return {
            type: type,
            position: position,
            isSpecial: false
        };
    }

    public static getRandomTileType(): TileType {
        const randomIndex = Math.floor(Math.random() * this.tileTypes.length);
        return this.tileTypes[randomIndex];
    }

    public static getAllTileTypes(): TileType[] {
        return [...this.tileTypes];
    }
}
