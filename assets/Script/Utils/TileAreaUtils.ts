import { Position } from "../Core/GameState";
import { PositionUtils } from "./PositionUtils";

export class TileAreaUtils {
    public static getTilesInRadius(center: Position, radius: number): Position[] {
        const tiles: Position[] = [];
        
        for (let y = center.y - radius; y <= center.y + radius; y++) {
            for (let x = center.x - radius; x <= center.x + radius; x++) {
                if (PositionUtils.isValidPositionXY(x, y)) {
                    tiles.push({ x, y });
                }
            }
        }
        
        return tiles;
    }

    public static getTilesInRow(row: number): Position[] {
        const tiles: Position[] = [];
        for (let x = 0; x < 8; x++) {
            tiles.push({ x, y: row });
        }
        return tiles;
    }

    public static getTilesInColumn(column: number): Position[] {
        const tiles: Position[] = [];
        for (let y = 0; y < 8; y++) {
            tiles.push({ x: column, y });
        }
        return tiles;
    }

    public static mergeTilePositions(tiles1: Position[], tiles2: Position[]): Position[] {
        const merged = [...tiles1];
        const existingPositions = new Set(tiles1.map(tile => `${tile.x},${tile.y}`));
        
        for (const tile of tiles2) {
            const key = `${tile.x},${tile.y}`;
            if (!existingPositions.has(key)) {
                merged.push(tile);
                existingPositions.add(key);
            }
        }
        
        return merged;
    }

    public static containsPosition(positions: Position[], target: Position): boolean {
        return positions.some(pos => PositionUtils.arePositionsEqual(pos, target));
    }
}
