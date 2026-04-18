const ProgressManager = {
    get() {
        const saved = localStorage.getItem('puzzleProgress');
        return saved ? JSON.parse(saved) : { currentLevel: 1, unlockedLevels: [1], revealedPieces: 0 };
    },
    save(progress) {
        localStorage.setItem('puzzleProgress', JSON.stringify(progress));
    },
    completeLevel(level) {
        let p = this.get();
        if (p.revealedPieces < 9) {
            p.revealedPieces++;
        }
        const nextLevel = level + 1;
        if (levels[nextLevel] && !p.unlockedLevels.includes(nextLevel)) {
            p.unlockedLevels.push(nextLevel);
            p.currentLevel = nextLevel;
        }
        this.save(p);
    }
};
