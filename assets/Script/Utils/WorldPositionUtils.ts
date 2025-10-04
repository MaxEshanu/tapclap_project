import { Position } from "../Core/GameState";

export class WorldPositionUtils {
    private static readonly TILE_SIZE = 100;
    private static readonly SPACING = 120;
    private static readonly FIELD_WIDTH = 8;
    private static readonly FIELD_HEIGHT = 8;

    public static getWorldPosition(position: Position): cc.Vec2 {
        const startX = -(this.FIELD_WIDTH - 1) * this.SPACING / 2;
        const startY = (this.FIELD_HEIGHT - 1) * this.SPACING / 2;
        
        return cc.v2(
            startX + position.x * this.SPACING,
            startY - position.y * this.SPACING
        );
    }

    public static getWorldPositionForField(position: Position): cc.Vec2 {
        const tileSize = 80;
        const startX = -(this.FIELD_WIDTH - 1) * tileSize / 2;
        const startY = (this.FIELD_HEIGHT - 1) * tileSize / 2;
        return cc.v2(
            startX + position.x * tileSize,
            startY - position.y * tileSize
        );
    }
}
