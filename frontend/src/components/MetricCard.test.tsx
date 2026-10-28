import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="CPU USAGE" value={78.5} unit="%" />);
    expect(screen.getByText('CPU USAGE')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('shows LIVE badge when isLive is true', () => {
    render(<MetricCard label="TEST" value={50} isLive />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('does not show LIVE badge by default', () => {
    render(<MetricCard label="TEST" value={50} />);
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
  });
});
