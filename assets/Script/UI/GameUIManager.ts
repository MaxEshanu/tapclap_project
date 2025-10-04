const { ccclass, property } = cc._decorator;

import { EventSystem, Events } from "../Core/EventSystem";
import { GameStats } from "../Core/GameState";

@ccclass
export class GameUIManager extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null!;

    @property(cc.Label)
    movesLabel: cc.Label = null!;

    @property(cc.Label)
    winLoseLabel: cc.Label = null!;

    private eventSystem!: EventSystem;

    onLoad() {
        this.eventSystem = EventSystem.getInstance();
        this.setupEventListeners();
        this.hideWinLoseMessage();
    }

    private setupEventListeners(): void {
        this.eventSystem.on(Events.SCORE_CHANGED, this.onScoreChanged.bind(this));
        this.eventSystem.on(Events.MOVES_CHANGED, this.onMovesChanged.bind(this));
        this.eventSystem.on(Events.GAME_WON, this.onGameWon.bind(this));
        this.eventSystem.on(Events.GAME_LOST, this.onGameLost.bind(this));
        this.eventSystem.on(Events.UI_UPDATE_REQUESTED, this.onUIUpdateRequested.bind(this));
    }

    private onScoreChanged(data?: number): void {
        if (data !== undefined) {
            this.updateScoreDisplay(data);
        }
    }

    private onMovesChanged(data?: number): void {
        if (data !== undefined) {
            this.updateMovesDisplay(data);
        }
    }

    private onGameWon(): void {
        this.showWinMessage();
    }

    private onGameLost(): void {
        this.showLoseMessage();
    }

    private onUIUpdateRequested(data?: GameStats): void {
        if (data) {
            this.updateScoreDisplay(data.score);
            this.updateMovesDisplay(data.moves);
            this.hideWinLoseMessage();
        }
    }

    private updateScoreDisplay(score: number): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `ОЧКИ:\n${score}/1500`;
        }
    }

    private updateMovesDisplay(moves: number): void {
        if (this.movesLabel) {
            this.movesLabel.string = moves.toString();
        }
    }

    private showWinMessage(): void {
        if (this.winLoseLabel) {
            this.winLoseLabel.string = "ПОБЕДА!";
            this.winLoseLabel.node.color = cc.Color.GREEN;
            this.animateWinLoseMessage();
        }
    }

    private showLoseMessage(): void {
        if (this.winLoseLabel) {
            this.winLoseLabel.string = "ПОРАЖЕНИЕ";
            this.winLoseLabel.node.color = cc.Color.RED;
            this.animateWinLoseMessage();
        }
    }

    private animateWinLoseMessage(): void {
        if (this.winLoseLabel) {
            this.winLoseLabel.node.active = true;
            this.winLoseLabel.node.scale = 0;
            const tween = cc.tween(this.winLoseLabel.node)
                .to(0.5, { scale: 1.0 })
                .start();
            
            const stopTween = () => {
                if (tween) {
                    tween.stop();
                }
            };
            
            this.winLoseLabel.node.on('destroy', stopTween);
            this.winLoseLabel.node.on('remove', stopTween);
        }
    }

    public hideWinLoseMessage(): void {
        if (this.winLoseLabel) {
            this.winLoseLabel.node.active = false;
        }
    }

    onDestroy() {
        this.eventSystem.off(Events.SCORE_CHANGED, this.onScoreChanged.bind(this));
        this.eventSystem.off(Events.MOVES_CHANGED, this.onMovesChanged.bind(this));
        this.eventSystem.off(Events.GAME_WON, this.onGameWon.bind(this));
        this.eventSystem.off(Events.GAME_LOST, this.onGameLost.bind(this));
        this.eventSystem.off(Events.UI_UPDATE_REQUESTED, this.onUIUpdateRequested.bind(this));
    }
}
