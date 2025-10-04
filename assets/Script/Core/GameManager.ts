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
    gameField: cc.Node = null;

    @property(cc.Node)
    tileContainer: cc.Node = null;

    @property(TileContainer)
    tileContainerComponent: TileContainer = null;

    @property(BoosterSystem)
    boosterSystem: BoosterSystem = null;

    @property(cc.Label)
    winLoseLabel: cc.Label = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    movesLabel: cc.Label = null;

    private currentState: GameState = GameState.MENU;
    private config: GameConfig;
    private stats: GameStats;
    private eventSystem: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupConfig();
        this.setupStats();
        this.setupEventListeners();
    }

    start() {
        this.hideWinLoseMessage();
        this.startNewGame();
    }

    private setupConfig(): void {
        this.config = {
            fieldWidth: 8,
            fieldHeight: 8,
            targetScore: 1000,
            maxMoves: 25,
            shuffleAttempts: 3
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
        this.eventSystem.on(Events.TILE_CLICKED, this.onTileClicked.bind(this));
        this.eventSystem.on(Events.TILES_BURNED, this.onTilesBurned.bind(this));
    }

    private startNewGame(): void {
        this.setGameState(GameState.PLAYING);
        this.updateUI();
        if (this.tileContainerComponent) {
            this.tileContainerComponent.initializeContainer(this.config);
        }
    }

    private setGameState(newState: GameState): void {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.eventSystem.emit(Events.GAME_STATE_CHANGED, newState);
        }
    }

    private onTileClicked(position: Position): void {
        if (this.currentState !== GameState.PLAYING) return;
        
        if (this.stats.moves <= 0) {
            return;
        }
        
        this.stats.moves = Math.max(0, this.stats.moves - 1);
        this.eventSystem.emit(Events.MOVES_CHANGED, this.stats.moves);
    }

    private onTilesBurned(burnedTiles: Position[]): void {
        const points = burnedTiles.length * 10;
        this.stats.score += points;
        this.eventSystem.emit(Events.SCORE_CHANGED, this.stats.score);
        this.updateUI();
        this.checkGameEnd();
    }

    private updateUI(): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `ОЧКИ:\n${this.stats.score}/${this.stats.targetScore}`;
        }
        if (this.movesLabel) {
            this.movesLabel.string = this.stats.moves.toString();
        }
    }

    private checkGameEnd(): void {
        if (this.stats.score >= this.stats.targetScore && !this.stats.isGameOver) {
            this.endGame(true, 'Целевой счет достигнут!');
        } else if (this.stats.moves <= 0 && !this.stats.isGameOver) {
            this.endGame(false, 'Закончились ходы');
        }
    }

    private endGame(isWin: boolean, reason: string): void {
        this.stats.isGameOver = true;
        this.stats.isWin = isWin;
        this.showWinLoseMessage(isWin);
        this.scheduleOnce(() => {
            this.restartGame();
        }, 3.0);
    }

    private showWinLoseMessage(isWin: boolean): void {
        if (this.winLoseLabel) {
            if (isWin) {
                this.winLoseLabel.string = "ПОБЕДА!";
                this.winLoseLabel.node.color = cc.Color.GREEN;
            } else {
                this.winLoseLabel.string = "ПОРАЖЕНИЕ";
                this.winLoseLabel.node.color = cc.Color.RED;
            }
            this.winLoseLabel.node.active = true;
            this.winLoseLabel.node.scale = 0;
            cc.tween(this.winLoseLabel.node)
                .to(0.5, { scale: 1.0 })
                .start();
        }
    }

    private hideWinLoseMessage(): void {
        if (this.winLoseLabel) {
            this.winLoseLabel.node.active = false;
        }
    }

    private restartGame(): void {
        this.hideWinLoseMessage();
        this.setupStats();
        if (this.boosterSystem) {
            this.boosterSystem.resetBoosters();
        }
        if (this.tileContainerComponent) {
            this.tileContainerComponent.initializeContainer(this.config);
        }
        this.updateUI();
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
