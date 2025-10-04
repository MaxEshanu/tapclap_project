/**
 * UI управление бустерами - обновление счетчиков и состояний кнопок
 */

const { ccclass, property } = cc._decorator;

import { BoosterType, BoosterState } from "../Core/BoosterTypes";
import { EventSystem, Events } from "../Core/EventSystem";
import { BoosterSystem } from "./BoosterSystem";

@ccclass
export class BoosterUI extends cc.Component {
    @property(cc.Label)
    bombCountLabel: cc.Label = null!;

    @property(cc.Label)
    teleportCountLabel: cc.Label = null!;

    @property(cc.Button)
    bombButton: cc.Button = null!;

    @property(cc.Button)
    teleportButton: cc.Button = null!;

    @property(BoosterSystem)
    boosterSystem: BoosterSystem = null!;

    private eventSystem!: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
        this.setupButtons();
        this.updateUI();
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.BOOSTER_UI_UPDATE, this.onUIUpdate.bind(this));
        this.eventSystem.on(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.on(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }

    private setupButtons(): void {
        if (this.bombButton) {
            this.bombButton.node.on(cc.Node.EventType.TOUCH_END, this.onBombButtonClicked.bind(this));
        }

        if (this.teleportButton) {
            this.teleportButton.node.on(cc.Node.EventType.TOUCH_END, this.onTeleportButtonClicked.bind(this));
        }
    }

    private onBombButtonClicked(): void {
        if (this.boosterSystem) {
            this.boosterSystem.activateBooster(BoosterType.BOMB);
        }
    }

    private onTeleportButtonClicked(): void {
        if (this.boosterSystem) {
            this.boosterSystem.activateBooster(BoosterType.TELEPORT);
        }
    }

    private onUIUpdate(data?: BoosterState): void {
        this.updateUI();
    }

    private onBoosterActivated(data?: { type?: BoosterType }): void {
        this.updateUI();
    }

    private onBoosterDeactivated(data?: { type?: BoosterType }): void {
        this.updateUI();
    }

    private updateUI(): void {
        if (!this.boosterSystem) return;
        
        if (this.bombCountLabel) {
            const bombCount = this.boosterSystem.getBoosterCount(BoosterType.BOMB);
            this.bombCountLabel.string = bombCount.toString();
        }
        
        if (this.teleportCountLabel) {
            const teleportCount = this.boosterSystem.getBoosterCount(BoosterType.TELEPORT);
            this.teleportCountLabel.string = teleportCount.toString();
        }
        
        this.updateButtonStates();
    }

    private updateButtonStates(): void {
        this.updateBombButtonState();
        this.updateTeleportButtonState();
    }

    private updateBombButtonState(): void {
        if (!this.bombButton || !this.boosterSystem) return;

        const bombCount = this.boosterSystem.getBoosterCount(BoosterType.BOMB);
        const isAvailable = bombCount > 0;
        
        this.bombButton.interactable = isAvailable;
        this.updateButtonVisual(this.bombButton, isAvailable);
    }

    private updateTeleportButtonState(): void {
        if (!this.teleportButton || !this.boosterSystem) return;

        const teleportCount = this.boosterSystem.getBoosterCount(BoosterType.TELEPORT);
        const isAvailable = teleportCount > 0;
        
        this.teleportButton.interactable = isAvailable;
        this.updateButtonVisual(this.teleportButton, isAvailable);
    }

    private updateButtonVisual(button: cc.Button, isAvailable: boolean): void {
        if (!button || !button.node) return;

        const opacity = isAvailable ? 255 : 128;
        button.node.opacity = opacity;
    }

    onDestroy() {
        this.eventSystem.off(Events.BOOSTER_UI_UPDATE, this.onUIUpdate.bind(this));
        this.eventSystem.off(Events.BOOSTER_ACTIVATED, this.onBoosterActivated.bind(this));
        this.eventSystem.off(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }
}

