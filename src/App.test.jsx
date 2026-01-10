import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Smoke Tests', () => {
    it('renders the Home page by default', () => {
        render(<App />);
        expect(screen.getByText(/Choose Your Opponent/i)).toBeInTheDocument();
        expect(screen.getByText('Martin')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<App />);
        expect(screen.getByText('Home')).toBeInTheDocument();
        const playButtons = screen.getAllByText('Play');
        expect(playButtons.length).toBeGreaterThan(0);
        expect(screen.getByText('Learn')).toBeInTheDocument();
    });
});
