/**
 * Логика бустера "Бомба" - сжигание тайлов в радиусе
 */

const { ccclass, property } = cc._decorator;

import { BoosterType, BoosterState } from "../Core/BoosterTypes";
import { Position } from "../Core/GameState";
import { EventSystem, Events } from "../Core/EventSystem";

@ccclass
export class BombBooster extends cc.Component {
    private eventSystem: EventSystem;
    private targetPosition: Position | null = null;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.BOOSTER_TARGET_SELECTED, this.onTargetSelected.bind(this));
        this.eventSystem.on(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.on(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }

    private onBoosterActivated(data: any): void {
        if (data.type === BoosterType.BOMB) {
            this.showTargetIndicator();
        }
    }

    private onBoosterDeactivated(data: any): void {
        if (data.type === BoosterType.BOMB) {
            this.hideTargetIndicator();
            this.targetPosition = null;
        }
    }

    private onTargetSelected(data: any): void {
        if (data.type !== BoosterType.BOMB) {
            return;
        }
        this.targetPosition = data.position;
        this.executeBombEffect();
    }

    private executeBombEffect(): void {
        if (!this.targetPosition) return;
        const radius = 1;
        const tilesToDestroy = this.getTilesInRadius(
            this.targetPosition.x, 
            this.targetPosition.y, 
            radius
        );

        if (tilesToDestroy.length > 0) {
            this.eventSystem.emit(Events.BOOSTER_BOMB_EXECUTE, {
                positions: tilesToDestroy,
                center: this.targetPosition
            });
        }

        this.eventSystem.emit(Events.BOOSTER_USED, { 
            type: BoosterType.BOMB
        });
        this.eventSystem.emit(Events.BOOSTER_DEACTIVATED, { type: BoosterType.BOMB });
    }

    private getTilesInRadius(centerX: number, centerY: number, radius: number): Position[] {
        const tiles: Position[] = [];
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (this.isValidPosition(x, y)) {
                    tiles.push({ x, y });
                }
            }
        }
        return tiles;
    }

    private isValidPosition(x: number, y: number): boolean {
        const fieldWidth = 8;
        const fieldHeight = 8;
        return x >= 0 && x < fieldWidth && y >= 0 && y < fieldHeight;
    }

    private showTargetIndicator(): void {
    }

    private hideTargetIndicator(): void {
    }

    onDestroy() {
        this.eventSystem.off(Events.BOOSTER_TARGET_SELECTED, this.onTargetSelected.bind(this));
        this.eventSystem.off(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.off(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }
}

