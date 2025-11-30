import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { LayoutDashboard, Package, LogOut, ReceiptText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function VendedorLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <nav className="flex items-center gap-8">
              <Link
                to="/vendedor/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/vendedor/dashboard')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              
              <Link
                to="/vendedor/produtos"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/vendedor/produtos')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Package className="h-5 w-5" />
                Produtos
              </Link>

              <Link
                to="/vendedor/vendas"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive('/vendedor/vendas')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ReceiptText className="h-5 w-5" />
                Minhas vendas
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="ml-4"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
