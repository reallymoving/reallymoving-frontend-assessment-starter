import { render, screen } from '@testing-library/react';
import { App } from './App';
describe('starter application', () => {
  it('provides the assessment starting point', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /build the removal-company comparison experience/i })).toBeInTheDocument();
  });
});
