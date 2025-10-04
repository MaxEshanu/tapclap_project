/**
 * Система событий для связи между компонентами
 */

import { GameState, Position } from "./GameState";

export interface EventCallback<T = any> {
    (data?: T): void;
}

export interface EventListener {
    event: string;
    callback: EventCallback;
}

export class EventSystem {
    private static instance: EventSystem;
    private events: Map<string, EventCallback[]> = new Map();

    static getInstance(): EventSystem {
        if (!EventSystem.instance) {
            EventSystem.instance = new EventSystem();
        }
        return EventSystem.instance;
    }

    clear(): void {
        this.events.clear();
    }

    on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);
    }

    off<T = any>(event: string, callback: EventCallback<T>): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit<T = any>(event: string, data?: T): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}

export const Events = {
    GAME_STATE_CHANGED: "game_state_changed",
    TILE_CLICKED: "tile_clicked",
    TILES_BURNED: "tiles_burned",
    TILES_FELL: "tiles_fell",
    SCORE_CHANGED: "score_changed",
    MOVES_CHANGED: "moves_changed",
    GAME_WON: "game_won",
    GAME_LOST: "game_lost",
    BOOSTER_ACTIVATED: "booster_activated",
    BOOSTER_DEACTIVATED: "booster_deactivated",
    BOOSTER_USED: "booster_used",
    BOOSTER_BUTTON_CLICKED: "booster_button_clicked",
    BOOSTER_TARGET_SELECTED: "booster_target_selected",
    BOOSTER_UI_UPDATE: "booster_ui_update",
    BOOSTER_BOMB_EXECUTE: "booster_bomb_execute",
    BOOSTER_TELEPORT_EXECUTE: "booster_teleport_execute",
    TELEPORT_FIRST_TILE_SELECTED: "teleport_first_tile_selected",
    TILES_SWAPPED: "tiles_swapped",
    ANIMATION_COMPLETED: "animation_completed",
    UI_UPDATE_REQUESTED: "ui_update_requested",
    TILES_DESTROYED: "tiles_destroyed",
    GROUP_BURNED_SUCCESSFULLY: "group_burned_successfully"
};
