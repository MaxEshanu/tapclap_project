/**
 * Компонент отдельного тайла с логикой и визуалом
 */

const { ccclass, property } = cc._decorator;

import { TileType, TileState, Position } from "../Core/GameState";
import { ITile, TileConfig } from "./TileTypes";
import { EventSystem, Events } from "../Core/EventSystem";

@ccclass
export class Tile extends cc.Component implements ITile {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.Button)
    button: cc.Button = null;

    @property([cc.SpriteFrame])
    tileSprites: cc.SpriteFrame[] = [];

    public type: TileType;
    public state: TileState = TileState.NORMAL;
    public position: Position;
    public isSpecial: boolean = false;
    public specialType: string = "";

    private eventSystem: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupButton();
    }

    private setupButton(): void {
        if (this.button) {
            this.button.node.on(cc.Node.EventType.TOUCH_END, this.onTileClicked, this);
        }
    }

    public initialize(config: TileConfig): void {
        this.type = config.type;
        this.position = config.position;
        this.isSpecial = config.isSpecial || false;
        this.specialType = config.specialType || "";
        this.state = TileState.NORMAL;
        this.node.setContentSize(100, 112);
        if (this.sprite) {
            this.sprite.node.setContentSize(100, 112);
        }
        this.updateVisual();
    }

    public updateVisual(): void {
        if (this.sprite && this.tileSprites.length > 0) {
            const spriteIndex = this.getSpriteIndex();
            if (spriteIndex >= 0 && spriteIndex < this.tileSprites.length) {
                this.sprite.spriteFrame = this.tileSprites[spriteIndex];
            }
        }
    }

    private getSpriteIndex(): number {
        const typeMap = {
            [TileType.BLUE]: 0,
            [TileType.GREEN]: 1,
            [TileType.RED]: 2,
            [TileType.YELLOW]: 3,
            [TileType.PURPLE]: 4,
            [TileType.SUPER_BOMB]: 5,
            [TileType.SUPER_BOMB_MAX]: 6,
            [TileType.SUPER_COLUMN]: 7,
            [TileType.SUPER_ROW]: 8
        };
        return typeMap[this.type] || 0;
    }

    private onTileClicked(): void {
        if (this.state === TileState.NORMAL) {
            this.eventSystem.emit(Events.TILE_CLICKED, this.position);
        }
    }

    public setState(newState: TileState): void {
        this.state = newState;
        this.updateVisual();
    }

    public canBeClicked(): boolean {
        return this.state === TileState.NORMAL;
    }

    public destroyTile(): void {
        this.node.destroy();
    }
}
