/**
 * Главный контроллер бустеров - связывает все компоненты системы бустеров
 */

const { ccclass, property } = cc._decorator;

import { BoosterManager } from "./BoosterManager";
import { BombBooster } from "./BombBooster";
import { TeleportBooster } from "./TeleportBooster";
import { BoosterUI } from "./BoosterUI";
import { BoosterType } from "../Core/BoosterTypes";
import { EventSystem, Events } from "../Core/EventSystem";

@ccclass
export class BoosterController extends cc.Component {
    @property(BoosterManager)
    boosterManager: BoosterManager = null;

    @property(BombBooster)
    bombBooster: BombBooster = null;

    @property(TeleportBooster)
    teleportBooster: TeleportBooster = null;

    @property(BoosterUI)
    boosterUI: BoosterUI = null;

    private eventSystem: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
        this.initializeComponents();
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }

    private initializeComponents(): void {
    }

    private onBoosterDeactivated(data: any): void {
        const boosterType = data.type;
    }

    public getBoosterManager(): BoosterManager {
        return this.boosterManager;
    }

    public getBombBooster(): BombBooster {
        return this.bombBooster;
    }

    public getTeleportBooster(): TeleportBooster {
        return this.teleportBooster;
    }

    public getBoosterUI(): BoosterUI {
        return this.boosterUI;
    }

    onDestroy() {
        this.eventSystem.off(Events.BOOSTER_DEACTIVATED, this.onBoosterDeactivated.bind(this));
    }
}

