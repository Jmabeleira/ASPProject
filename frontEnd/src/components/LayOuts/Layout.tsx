// components/Layout.tsx
import { ReactNode } from "react";
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/home">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/categories-list">Categories</Link>
          </li>
          <li className="nav-item">
            <Link to="/companies-list">Companies</Link>
          </li>
          <li className="nav-item">
            <Link to="/areas-list">Areas</Link>
          </li>
          <li className="nav-item">
            <Link to="/invites">Invites</Link>
          </li>
          <li className="nav-item">
            <Link to="/apikeys-list">API Keys</Link>
          </li>
        </ul>
      </nav>
      
      <main className="container">
        {children}
      </main>
    </div>
  );
}