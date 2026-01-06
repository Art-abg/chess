
import React, { useEffect, useState } from 'react';
import { generateGameReport } from '../game/GameReview';
import '../styles/gamereview.css';

export default function GameReviewModal({ game, onClose, playerColor = 'w' }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const analyze = async () => {
            try {
                const history = game.history({ verbose: true });
                const rep = await generateGameReport(history, playerColor);
                setReport(rep);
            } catch (err) {
                console.error("Game Review Failed:", err);
                setReport({ error: true });
            } finally {
                setLoading(false);
            }
        };
        analyze();
    }, [game, playerColor]);

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content loading">
                    <div className="spinner"></div>
                    <h2>Analyzing Game...</h2>
                    <p>Generating Diamond Report</p>
                </div>
            </div>
        );
    }

    if (!report || report.error) {
        return (
            <div className="modal-overlay">
                <div className="modal-content review-card">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <h2>Analysis Error</h2>
                    <p style={{color:'#ccc'}}>Could not analyze this game. Please try again.</p>
                </div>
            </div>
        );
    }

    const { accuracy, moveStats } = report;

    return (
        <div className="modal-overlay">
            <div className="modal-content review-card">
                <button className="close-btn" onClick={onClose}>×</button>
                
                <div className="review-header">
                    <h2>Game Report</h2>
                    <div className="accuracy-badge">
                        <span className="value">{isNaN(accuracy) ? '-' : Math.round(accuracy)}%</span>
                        <span className="label">Accuracy</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-row brilliant">
                        <span className="icon">!!</span>
                        <span className="name">Brilliant</span>
                        <span className="count">{moveStats.brilliant}</span>
                    </div>
                    <div className="stat-row best">
                        <span className="icon">★</span>
                        <span className="name">Best</span>
                        <span className="count">{moveStats.best}</span>
                    </div>
                    <div className="stat-row good">
                        <span className="icon">✓</span>
                        <span className="name">Good</span>
                        <span className="count">{moveStats.good}</span>
                    </div>
                    <div className="stat-row mistake">
                        <span className="icon">?</span>
                        <span className="name">Mistake</span>
                        <span className="count">{moveStats.mistake + moveStats.inaccuracy}</span>
                    </div>
                    <div className="stat-row blunder">
                        <span className="icon">??</span>
                        <span className="name">Blunder</span>
                        <span className="count">{moveStats.blunder}</span>
                    </div>
                </div>

                <div className="review-chart">
                    {/* Placeholder for visual chart */}
                    <div className="chart-bar" style={{width: `${accuracy}%`}}></div>
                </div>
            </div>
        </div>
    );
}
