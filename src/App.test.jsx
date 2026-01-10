import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Smoke Tests', () => {
    it('renders the Home page by default', () => {
        render(<App />);
        expect(screen.getByText(/Play Chess/i)).toBeInTheDocument();
        expect(screen.getByText(/Get Better/i)).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<App />);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Play')).toBeInTheDocument();
        expect(screen.getByText('Learn')).toBeInTheDocument();
    });
});
