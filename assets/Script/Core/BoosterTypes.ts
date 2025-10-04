/**
 * Типы и интерфейсы для системы бустеров
 */

import { Position } from "./GameState";

export enum BoosterType {
    BOMB = "bomb",
    TELEPORT = "teleport"
}

export enum BoosterState {
    INACTIVE = "inactive",
    ACTIVE = "active",
    WAITING_TARGET = "waiting_target"
}

export interface BoosterConfig {
    type: BoosterType;
    maxUses: number;
    currentUses: number;
    isUnlocked: boolean;
    radius?: number;
}

export interface BoosterData {
    bomb: BoosterConfig;
    teleport: BoosterConfig;
}

