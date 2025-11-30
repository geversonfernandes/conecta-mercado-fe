import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { VendedorLayout } from "@/components/VendedorLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/vendedor/Dashboard";
import Produtos from "./pages/vendedor/Produtos";
import NovoProduto from "./pages/vendedor/NovoProduto";
import EditarProduto from "./pages/vendedor/EditarProduto";
import ProdutosCliente from "./pages/cliente/Produtos";
import Carrinho from "./pages/cliente/Carrinho";
import Pagamento from "./pages/cliente/Pagamento";
import NotFound from "./pages/NotFound";
import ProdutoDetalhe from "./pages/cliente/ProdutoDetalhe";
import PedidosCliente from "./pages/cliente/Pedidos";
import MinhasVendas from "./pages/vendedor/MinhasVendas"

const queryClient = new QueryClient();

/** Componente wrapper que protege rotas por autenticação e role opcional */
const RequireAuth: React.FC<{ children: React.ReactElement; role?: "cliente" | "vendedor" }> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth() as any;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === "vendedor" ? "/vendedor/dashboard" : "/produtos"} replace />;
  }

  return children;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            
            {/* vendedor - protegido por role */}
            <Route
              path="/vendedor/vendas"
              element={
                <RequireAuth role="vendedor">
                  <VendedorLayout>
                    <MinhasVendas />
                  </VendedorLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/vendedor/dashboard"
              element={
                <RequireAuth role="vendedor">
                  <VendedorLayout>
                    <Dashboard />
                  </VendedorLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/vendedor/produtos"
              element={
                <RequireAuth role="vendedor">
                  <VendedorLayout>
                    <Produtos />
                  </VendedorLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/vendedor/produtos/novo"
              element={
                <RequireAuth role="vendedor">
                  <VendedorLayout>
                    <NovoProduto />
                  </VendedorLayout>
                </RequireAuth>
              }
            />

            <Route
              path="/vendedor/produtos/editar/:id"
              element={
                <RequireAuth role="vendedor">
                  <VendedorLayout>
                    <EditarProduto />
                  </VendedorLayout>
                </RequireAuth>
              }
            />

            {/* cliente */}
            <Route path="/produtos" element={<ProdutosCliente />} />
            <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
            <Route
              path="/carrinho"
              element={
                <RequireAuth role="cliente">
                  <Carrinho />
                </RequireAuth>
              }
            />
            <Route
              path="/pagamento"
              element={
                <RequireAuth role="cliente">
                  <Pagamento />
                </RequireAuth>
              }
            />
            <Route
              path="/pedidos"
              element={
                <RequireAuth role="cliente">
                  <PedidosCliente />
                </RequireAuth>
              }
            />

            {/* fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
