const ProgressManager = {
    get() {
        const saved = localStorage.getItem('puzzleProgress');
        const defaultState = { currentLevel: 1, unlockedLevels: [1], revealedPieces: 0 };
        if (!saved) return defaultState;
        
        try {
            const parsed = JSON.parse(saved);
            // On s'assure que unlockedLevels existe bien (fusion avec l'état par défaut)
            return { 
                currentLevel: parsed.currentLevel || 1, 
                unlockedLevels: parsed.unlockedLevels || [1], 
                revealedPieces: parsed.revealedPieces || 0 
            };
        } catch(e) {
            return defaultState;
        }
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
        if (levels[nextLevel]) {
            // Sécurité supplémentaire au cas où unlockedLevels ne serait pas un tableau
            if (!Array.isArray(p.unlockedLevels)) {
                p.unlockedLevels = [1];
            }
            if (!p.unlockedLevels.includes(nextLevel)) {
                p.unlockedLevels.push(nextLevel);
            }
            p.currentLevel = nextLevel;
        }
        this.save(p);
    }
};
