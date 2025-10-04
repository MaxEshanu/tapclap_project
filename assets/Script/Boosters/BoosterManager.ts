/**
 * Основной менеджер бустеров - управляет активацией и деактивацией
 */

const { ccclass, property } = cc._decorator;

import { BoosterType, BoosterState, BoosterData, BoosterConfig } from "../Core/BoosterTypes";
import { Position } from "../Core/GameState";
import { EventSystem, Events } from "../Core/EventSystem";

@ccclass
export class BoosterManager extends cc.Component {
    @property(cc.Node)
    bombButton: cc.Node = null;

    @property(cc.Node)
    teleportButton: cc.Node = null;

    private currentBooster: BoosterType | null = null;
    private boosterState: BoosterState = BoosterState.INACTIVE;
    private boosterData: BoosterData;
    private eventSystem: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.initializeBoosterData();
        this.setupEventListeners();
        this.updateUI();
    }

    start() {
        this.scheduleOnce(() => {
            this.updateUI();
        }, 0.1);
    }

    private initializeBoosterData(): void {
        this.boosterData = {
            bomb: {
                type: BoosterType.BOMB,
                maxUses: 3,
                currentUses: 3,
                isUnlocked: true,
                radius: 1
            },
            teleport: {
                type: BoosterType.TELEPORT,
                maxUses: 5,
                currentUses: 5,
                isUnlocked: true
            }
        };
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.TILE_CLICKED, this.onTileClicked.bind(this));
        this.eventSystem.on(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.on(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
        this.eventSystem.on(Events.BOOSTER_USED, this.onBoosterUsed.bind(this));
    }

    public activateBooster(type: BoosterType): boolean {
        if (this.boosterState !== BoosterState.INACTIVE) {
            return false;
        }

        const config = this.boosterData[type];
        if (!config.isUnlocked || config.currentUses <= 0) {
            return false;
        }

        this.currentBooster = type;
        this.boosterState = BoosterState.WAITING_TARGET;
        this.eventSystem.emit(Events.BOOSTER_ACTIVATED, { type, state: this.boosterState });
        this.updateUI();
        return true;
    }

    public deactivateBooster(): void {
        if (this.boosterState === BoosterState.INACTIVE) return;
        this.eventSystem.emit(Events.BOOSTER_DEACTIVATED, { 
            type: this.currentBooster, 
            state: this.boosterState 
        });

        this.currentBooster = null;
        this.boosterState = BoosterState.INACTIVE;
        this.updateUI();
    }

    public useBooster(): boolean {
        if (!this.currentBooster || this.boosterState !== BoosterState.ACTIVE) {
            return false;
        }

        const config = this.boosterData[this.currentBooster];
        if (config.currentUses <= 0) {
            return false;
        }

        config.currentUses--;
        this.eventSystem.emit(Events.BOOSTER_USED, { 
            type: this.currentBooster, 
            remainingUses: config.currentUses 
        });

        this.deactivateBooster();
        this.updateUI();
        return true;
    }

    private onBoosterActivated(data: any): void {
        const boosterType = data.type;
        this.activateBooster(boosterType);
    }

    private onBoosterDeactivated(data: any): void {
        const boosterType = data.type;
        if (this.currentBooster === boosterType) {
            this.currentBooster = null;
            this.boosterState = BoosterState.INACTIVE;
            this.updateUI();
        }
    }

    private onBoosterUsed(data: any): void {
        const boosterType = data.type;
        if (this.boosterData && this.boosterData[boosterType]) {
            this.boosterData[boosterType].currentUses = Math.max(0, this.boosterData[boosterType].currentUses - 1);
            this.eventSystem.emit(Events.BOOSTER_UI_UPDATE, this.boosterData);
        }
    }

    private onTileClicked(position: Position): void {
        if (this.boosterState !== BoosterState.WAITING_TARGET) {
            return;
        }
        if (this.currentBooster === BoosterType.TELEPORT) {
            this.eventSystem.emit(Events.BOOSTER_TARGET_SELECTED, { 
                type: this.currentBooster, 
                position 
            });
        } else {
            this.boosterState = BoosterState.ACTIVE;
            this.eventSystem.emit(Events.BOOSTER_TARGET_SELECTED, { 
                type: this.currentBooster, 
                position 
            });
        }
    }

    public getCurrentBooster(): BoosterType | null {
        return this.currentBooster;
    }

    public getBoosterState(): BoosterState {
        return this.boosterState;
    }

    public getBoosterConfig(type: BoosterType): BoosterConfig {
        return this.boosterData[type];
    }

    private updateUI(): void {
        this.eventSystem.emit(Events.BOOSTER_UI_UPDATE, this.boosterData);
    }

    onDestroy() {
        this.eventSystem.off(Events.TILE_CLICKED, this.onTileClicked.bind(this));
        this.eventSystem.off(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.off(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
        this.eventSystem.off(Events.BOOSTER_USED, this.onBoosterUsed.bind(this));
    }
}

