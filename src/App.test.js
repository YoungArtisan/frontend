import { render, screen } from '@testing-library/react';
import App from './App';

test('renders young artisan header', () => {
  render(<App />);
  const linkElement = screen.getByText(/YoungArtisan/i);
  expect(linkElement).toBeInTheDocument();
});
