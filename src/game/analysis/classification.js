export const Classification = {
    BRILLIANT: "brilliant",
    GREAT: "great",
    BEST: "best",
    EXCELLENT: "excellent",
    GOOD: "good",
    INACCURACY: "inaccuracy",
    MISTAKE: "mistake",
    BLUNDER: "blunder",
    BOOK: "book",
    FORCED: "forced"
};

export const classificationValues = {
    "blunder": 0,
    "mistake": 0.2,
    "inaccuracy": 0.4,
    "good": 0.65,
    "excellent": 0.9,
    "best": 1,
    "great": 1,
    "brilliant": 1,
    "book": 1,
    "forced": 1
};

export const centipawnClassifications = [
    Classification.BEST,
    Classification.EXCELLENT,
    Classification.GOOD,
    Classification.INACCURACY,
    Classification.MISTAKE,
    Classification.BLUNDER
];

export function getEvaluationLossThreshold(classif, prevEval) {
    prevEval = Math.abs(prevEval);
    let threshold = 0;

    switch (classif) {
        case Classification.BEST:
            threshold = 0.0001 * Math.pow(prevEval, 2) + (0.0236 * prevEval) - 3.7143;
            break;
        case Classification.EXCELLENT:
            threshold = 0.0002 * Math.pow(prevEval, 2) + (0.1231 * prevEval) + 27.5455;
            break;
        case Classification.GOOD:
            threshold = 0.0002 * Math.pow(prevEval, 2) + (0.2643 * prevEval) + 60.5455;
            break;
        case Classification.INACCURACY:
            threshold = 0.0002 * Math.pow(prevEval, 2) + (0.3624 * prevEval) + 108.0909;
            break;
        case Classification.MISTAKE:
            threshold = 0.0003 * Math.pow(prevEval, 2) + (0.4027 * prevEval) + 225.8182;
            break;
        default:
            threshold = Infinity;
    }

    return Math.max(threshold, 0);
}

export function getClassificationStyle(classif) {
    const styles = {
        [Classification.BRILLIANT]: { icon: '!!', color: '#1baca6' },
        [Classification.GREAT]: { icon: '!', color: '#5c8bb0' },
        [Classification.BEST]: { icon: '★', color: '#96bc4b' },
        [Classification.EXCELLENT]: { icon: '★', color: '#96bc4b' },
        [Classification.GOOD]: { icon: '✓', color: '#a88d5e' },
        [Classification.BOOK]: { icon: '📖', color: '#a8886d' },
        [Classification.INACCURACY]: { icon: '?!', color: '#f0c15e' },
        [Classification.MISTAKE]: { icon: '?', color: '#e6912c' },
        [Classification.BLUNDER]: { icon: '??', color: '#b33430' },
        [Classification.FORCED]: { icon: '→', color: '#989795' }
    };
    return styles[classif] || { icon: '', color: 'transparent' };
}
