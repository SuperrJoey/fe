import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

jest.mock('../../../contexts/AuthContext', () => {
  return {
    useAuth: () => ({ user: { id: 'u1', name: 'Test User', email: 'test@example.com' }, loading: false }),
  };
});

function Dummy() {
  return <div>Protected Content</div>;
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('renders children when authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute><Dummy /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when unauthenticated', async () => {
    jest.doMock('../../../contexts/AuthContext', () => ({
      useAuth: () => ({ user: null, loading: false }),
    }));
    const { rerender } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={<ProtectedRoute><Dummy /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/protected" element={<ProtectedRoute><Dummy /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});


