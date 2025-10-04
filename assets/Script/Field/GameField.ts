/**
 * Управление игровым полем и позиционированием тайлов
 */

const { ccclass, property } = cc._decorator;

import { GameConfig, Position } from "../Core/GameState";
import { EventSystem, Events } from "../Core/EventSystem";
import { PositionUtils } from "../Utils/PositionUtils";
import { WorldPositionUtils } from "../Utils/WorldPositionUtils";

@ccclass
export class GameField extends cc.Component {
    @property(cc.Node)
    tileContainer: cc.Node = null!;

    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null!;

    private config!: GameConfig;
    private field!: cc.Node[][];
    private eventSystem!: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
    }

    public initializeField(config: GameConfig): void {
        this.config = config;
        this.createField();
    }

    private createField(): void {
        this.field = [];
        for (let x = 0; x < this.config.fieldWidth; x++) {
            this.field[x] = [];
            for (let y = 0; y < this.config.fieldHeight; y++) {
                this.field[x][y] = null!;
            }
        }
    }

    public getTileAt(position: Position): cc.Node | null {
        if (this.isValidPosition(position)) {
            return this.field[position.x][position.y];
        }
        return null;
    }

    public setTileAt(position: Position, tile: cc.Node): void {
        if (this.isValidPosition(position)) {
            this.field[position.x][position.y] = tile;
        }
    }

    public removeTileAt(position: Position): void {
        if (this.isValidPosition(position)) {
            this.field[position.x][position.y] = null!;
        }
    }

    public isValidPosition(position: Position): boolean {
        return PositionUtils.isValidPosition(position);
    }

    public getWorldPosition(position: Position): cc.Vec2 {
        return WorldPositionUtils.getWorldPositionForField(position);
    }

    public getAllPositions(): Position[] {
        const positions: Position[] = [];
        for (let x = 0; x < this.config.fieldWidth; x++) {
            for (let y = 0; y < this.config.fieldHeight; y++) {
                positions.push({ x, y });
            }
        }
        return positions;
    }
}
