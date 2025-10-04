/**
 * Логика бустера "Телепорт" - обмен местами двух тайлов
 */

const { ccclass, property } = cc._decorator;

import { BoosterType, BoosterState, TileSwapData } from "../Core/BoosterTypes";
import { Position } from "../Core/GameState";
import { EventSystem, Events } from "../Core/EventSystem";

@ccclass
export class TeleportBooster extends cc.Component {
    private eventSystem: EventSystem;
    private firstTilePosition: Position | null = null;
    private secondTilePosition: Position | null = null;
    private isWaitingForSecondTile: boolean = false;

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
        if (data.type === BoosterType.TELEPORT) {
            this.isWaitingForSecondTile = false;
            this.firstTilePosition = null;
            this.secondTilePosition = null;
            this.showTargetIndicator();
        }
    }

    private onBoosterDeactivated(data: any): void {
        if (data.type === BoosterType.TELEPORT) {
            this.hideTargetIndicator();
            this.resetSelection();
        }
    }

    private onTargetSelected(data: any): void {
        if (data.type !== BoosterType.TELEPORT) {
            return;
        }
        
        this.handleTileSelection(data.position);
    }

    private handleTileSelection(position: Position): void {
        if (!this.isWaitingForSecondTile) {
            this.firstTilePosition = position;
            this.isWaitingForSecondTile = true;
        } else {
            this.secondTilePosition = position;
            
            if (this.validateSelection()) {
                this.executeTeleport();
            } else {
                this.resetSelection();
            }
        }
    }

    private validateSelection(): boolean {
        if (!this.firstTilePosition || !this.secondTilePosition) {
            return false;
        }

        if (this.firstTilePosition.x === this.secondTilePosition.x && 
            this.firstTilePosition.y === this.secondTilePosition.y) {
            return false;
        }

        return true;
    }

    private executeTeleport(): void {
        if (!this.firstTilePosition || !this.secondTilePosition) {
            return;
        }

        this.eventSystem.emit(Events.BOOSTER_TELEPORT_EXECUTE, {
            position1: this.firstTilePosition,
            position2: this.secondTilePosition
        });

        this.eventSystem.emit(Events.BOOSTER_USED, { 
            type: BoosterType.TELEPORT
        });
        
        this.eventSystem.emit(Events.BOOSTER_DEACTIVATED, { type: BoosterType.TELEPORT });

        this.resetSelection();
    }

    private resetSelection(): void {
        this.firstTilePosition = null;
        this.secondTilePosition = null;
        this.isWaitingForSecondTile = false;
        this.hideTargetIndicator();
    }

    private showTargetIndicator(): void {
    }

    private hideTargetIndicator(): void {
    }

    public getFirstTilePosition(): Position | null {
        return this.firstTilePosition;
    }

    public getSecondTilePosition(): Position | null {
        return this.secondTilePosition;
    }

    public isWaitingForSecond(): boolean {
        return this.isWaitingForSecondTile;
    }

    onDestroy() {
        this.eventSystem.off(Events.BOOSTER_TARGET_SELECTED, this.onTargetSelected.bind(this));
        this.eventSystem.off(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.off(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }
}

