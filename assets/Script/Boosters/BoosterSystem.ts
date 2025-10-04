/**
 * Единая система бустеров - упрощенная версия по образцу рабочего примера
 */

const { ccclass, property } = cc._decorator;

import { BoosterType, BoosterState } from "../Core/BoosterTypes";
import { Position } from "../Core/GameState";
import { EventSystem, Events } from "../Core/EventSystem";

interface BoosterActivation {
    type: BoosterType;
    isActive: boolean;
    selectedTiles: Position[];
}

@ccclass
export class BoosterSystem extends cc.Component {
    private eventSystem: EventSystem;
    
    private boosterState = {
        bomb: 3,
        teleport: 5
    };
    
    private activation: BoosterActivation = {
        type: BoosterType.BOMB,
        isActive: false,
        selectedTiles: []
    };

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.TILE_CLICKED, this.handleTileClick.bind(this));
    }

    public activateBooster(type: BoosterType): void {
        if (!this.canActivateBooster(type)) {
            return;
        }
        
        if (this.activation.isActive) {
            this.deactivateBooster();
        }
        this.activation = {
            type,
            isActive: true,
            selectedTiles: []
        };
        this.eventSystem.emit(Events.BOOSTER_ACTIVATED, {
            type,
            instruction: this.getBoosterInstruction(type)
        });
    }

    private canActivateBooster(type: BoosterType): boolean {
        switch (type) {
            case BoosterType.BOMB:
                return this.boosterState.bomb > 0;
            case BoosterType.TELEPORT:
                return this.boosterState.teleport > 0;
            default:
                return false;
        }
    }

    private handleTileClick(position: Position): void {
        if (!this.activation.isActive) {
            return;
        }
        
        switch (this.activation.type) {
            case BoosterType.BOMB:
                this.handleBombClick(position);
                break;
            case BoosterType.TELEPORT:
                this.handleTeleportClick(position);
                break;
        }
    }

    private handleBombClick(position: Position): void {
        const tilesToDestroy = this.getTilesInRadius(position, 1);
        
        if (tilesToDestroy.length > 0) {
            this.eventSystem.emit(Events.BOOSTER_BOMB_EXECUTE, {
                positions: tilesToDestroy,
                center: position
            });
            
            this.consumeBooster(BoosterType.BOMB);
            this.deactivateBooster();
        }
    }

    private handleTeleportClick(position: Position): void {
        this.activation.selectedTiles.push(position);
        if (this.activation.selectedTiles.length === 1) {
            this.eventSystem.emit(Events.TELEPORT_FIRST_TILE_SELECTED, { position });
        } else if (this.activation.selectedTiles.length === 2) {
            const [tile1, tile2] = this.activation.selectedTiles;
            
            this.eventSystem.emit(Events.BOOSTER_TELEPORT_EXECUTE, {
                position1: tile1,
                position2: tile2
            });
            
            this.consumeBooster(BoosterType.TELEPORT);
            this.deactivateBooster();
        }
    }

    private getTilesInRadius(center: Position, radius: number): Position[] {
        const tiles: Position[] = [];
        
        for (let y = center.y - radius; y <= center.y + radius; y++) {
            for (let x = center.x - radius; x <= center.x + radius; x++) {
                if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                    tiles.push({ x, y });
                }
            }
        }
        
        return tiles;
    }

    private consumeBooster(type: BoosterType): void {
        switch (type) {
            case BoosterType.BOMB:
                if (this.boosterState.bomb > 0) {
                    this.boosterState.bomb--;
                }
                break;
            case BoosterType.TELEPORT:
                if (this.boosterState.teleport > 0) {
                    this.boosterState.teleport--;
                }
                break;
        }
        
        this.eventSystem.emit(Events.BOOSTER_UI_UPDATE, this.boosterState);
    }

    private deactivateBooster(): void {
        if (this.activation.isActive) {
            this.activation = {
                type: BoosterType.BOMB,
                isActive: false,
                selectedTiles: []
            };
            this.eventSystem.emit(Events.BOOSTER_DEACTIVATED, {
                type: this.activation.type
            });
        }
    }

    private getBoosterInstruction(type: BoosterType): string {
        switch (type) {
            case BoosterType.BOMB:
                return 'Выберите тайл для взрыва (3x3 область)';
            case BoosterType.TELEPORT:
                return 'Выберите два тайла для обмена местами';
            default:
                return 'Неизвестный бустер';
        }
    }

    public getBoosterCount(type: BoosterType): number {
        switch (type) {
            case BoosterType.BOMB:
                return this.boosterState.bomb;
            case BoosterType.TELEPORT:
                return this.boosterState.teleport;
            default:
                return 0;
        }
    }

    public isBoosterActive(): boolean {
        return this.activation.isActive;
    }

    public getActiveBoosterType(): BoosterType | null {
        return this.activation.isActive ? this.activation.type : null;
    }

    public resetBoosters(): void {
        this.boosterState = {
            bomb: 3,
            teleport: 5
        };
        
        if (this.activation.isActive) {
            this.deactivateBooster();
        }
        this.eventSystem.emit(Events.BOOSTER_UI_UPDATE, this.boosterState);
    }

    onDestroy() {
        this.eventSystem.off(Events.TILE_CLICKED, this.handleTileClick.bind(this));
    }
}
