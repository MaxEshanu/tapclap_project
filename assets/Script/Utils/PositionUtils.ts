import { Position } from "../Core/GameState";

export class PositionUtils {
    private static readonly FIELD_WIDTH = 8;
    private static readonly FIELD_HEIGHT = 8;

    public static isValidPosition(position: Position): boolean {
        return position.x >= 0 && position.x < this.FIELD_WIDTH &&
               position.y >= 0 && position.y < this.FIELD_HEIGHT;
    }

    public static isValidPositionXY(x: number, y: number): boolean {
        return x >= 0 && x < this.FIELD_WIDTH && y >= 0 && y < this.FIELD_HEIGHT;
    }

    public static arePositionsEqual(pos1: Position, pos2: Position): boolean {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }

    public static getDistance(pos1: Position, pos2: Position): number {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
