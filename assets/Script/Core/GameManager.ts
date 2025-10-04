/**
 * Основной контроллер игры - управляет состоянием и логикой
 */

const { ccclass, property } = cc._decorator;

import { GameState, GameConfig, GameStats, Position } from "./GameState";
import { EventSystem, Events } from "./EventSystem";
import { TileContainer } from "../Field/TileContainer";
import { BoosterSystem } from "../Boosters/BoosterSystem";

@ccclass
export class GameManager extends cc.Component {
    @property(cc.Node)
    gameField: cc.Node = null!;

    @property(cc.Node)
    tileContainer: cc.Node = null!;

    @property(TileContainer)
    tileContainerComponent: TileContainer = null!;

    @property(BoosterSystem)
    boosterSystem: BoosterSystem = null!;


    private currentState: GameState = GameState.MENU;
    private config!: GameConfig;
    private stats!: GameStats;
    private eventSystem!: EventSystem;
    
    private boundOnTileClicked!: (data?: Position) => void;
    private boundOnTilesBurned!: (data?: Position[]) => void;
    private boundOnGroupBurnedSuccessfully!: (data?: void) => void;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupConfig();
        this.setupStats();
        this.setupEventListeners();
    }

    start() {
        this.startNewGame();
    }

    private setupConfig(): void {
        this.config = {
            fieldWidth: 8,
            fieldHeight: 8,
            targetScore: 1500,
            maxMoves: 25,
            shuffleAttempts: 2
        };
    }

    private setupStats(): void {
        this.stats = {
            score: 0,
            moves: Math.max(0, this.config.maxMoves),
            targetScore: this.config.targetScore,
            maxMoves: this.config.maxMoves,
            shufflesLeft: this.config.shuffleAttempts,
            isGameOver: false,
            isWin: false
        };
    }

    private setupEventListeners(): void {
        this.boundOnTileClicked = this.onTileClicked.bind(this);
        this.boundOnTilesBurned = this.onTilesBurned.bind(this);
        this.boundOnGroupBurnedSuccessfully = this.onGroupBurnedSuccessfully.bind(this);
        
        this.eventSystem.on(Events.TILE_CLICKED, this.boundOnTileClicked);
        this.eventSystem.on(Events.TILES_BURNED, this.boundOnTilesBurned);
        this.eventSystem.on(Events.GROUP_BURNED_SUCCESSFULLY, this.boundOnGroupBurnedSuccessfully);
    }

    private startNewGame(): void {
        this.setGameState(GameState.PLAYING);
        this.eventSystem.emit(Events.UI_UPDATE_REQUESTED, this.stats);
        if (this.tileContainerComponent && this.config) {
            this.tileContainerComponent.initializeContainer(this.config);
        }
    }

    private setGameState(newState: GameState): void {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.eventSystem.emit(Events.GAME_STATE_CHANGED, newState);
        }
    }

    private onTileClicked(data?: Position): void {
        if (!data) return;
        const position = data;
        if (this.currentState !== GameState.PLAYING) return;
        
        if (this.stats.moves <= 0) {
            return;
        }   
    }

    private onTilesBurned(data?: Position[]): void {
        if (!data) return;
        const burnedTiles = data;
        const points = burnedTiles.length * 10;
        this.stats.score += points;
        this.eventSystem.emit(Events.SCORE_CHANGED, this.stats.score);
        this.checkGameEnd();
    }

    private onGroupBurnedSuccessfully(data?: void): void {
        this.stats.moves = Math.max(0, this.stats.moves - 1);
        this.eventSystem.emit(Events.MOVES_CHANGED, this.stats.moves);
    }

    private checkGameEnd(): void {
        if (this.stats.score >= this.stats.targetScore && !this.stats.isGameOver) {
            this.endGame(true, 'Целевой счет достигнут!');
        } else if (this.stats.moves <= 0 && !this.stats.isGameOver) {
            this.handleNoMovesLeft();
        }
    }

    private handleNoMovesLeft(): void {
        if (this.stats.shufflesLeft > 0) {
            this.stats.shufflesLeft--;
            this.stats.moves += 5;
            this.eventSystem.emit(Events.MOVES_CHANGED, this.stats.moves);
            
            this.scheduleOnce(() => {
                this.shuffleField();
            }, 0.5);
        } else {
            this.endGame(false, 'Закончились ходы и попытки перемешивания');
        }
    }

    private shuffleField(): void {
        if (this.tileContainerComponent) {
            this.tileContainerComponent.shuffleField();
        }
    }

    private endGame(isWin: boolean, reason: string): void {
        this.stats.isGameOver = true;
        this.stats.isWin = isWin;
        
        if (isWin) {
            this.eventSystem.emit(Events.GAME_WON);
        } else {
            this.eventSystem.emit(Events.GAME_LOST);
        }
        
        this.scheduleOnce(() => {
            this.restartGame();
        }, 3.0);
    }

    private restartGame(): void {
        this.setupStats();
        if (this.boosterSystem) {
            this.boosterSystem.resetBoosters();
        }
        if (this.tileContainerComponent) {
            this.tileContainerComponent.initializeContainer(this.config);
        }
        this.eventSystem.emit(Events.UI_UPDATE_REQUESTED, this.stats);
    }

    onDestroy() {
        this.eventSystem.off(Events.TILE_CLICKED, this.boundOnTileClicked);
        this.eventSystem.off(Events.TILES_BURNED, this.boundOnTilesBurned);
        this.eventSystem.off(Events.GROUP_BURNED_SUCCESSFULLY, this.boundOnGroupBurnedSuccessfully);
    }

    public refreshEntireField(): void {
        if (this.tileContainerComponent) {
            this.tileContainerComponent.refreshEntireField();
        }
    }

    public getCurrentState(): GameState {
        return this.currentState;
    }

    public getStats(): GameStats {
        return { ...this.stats };
    }

    public getConfig(): GameConfig {
        return { ...this.config };
    }
}
