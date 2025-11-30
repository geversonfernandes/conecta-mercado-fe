import React, { useEffect, useState } from "react";
import { cartApi, orderApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { ClienteLayout } from "@/components/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type CartItem = {
  productId: {
    _id: string;
    title: string;
    price: number;
    images?: { url: string; publicId?: string }[];
  } | string;
  qty: number;
  unitPrice: number;
};

type CartData = {
  items: CartItem[];
  total: number;
};

const Carrinho: React.FC = () => {
  const [cart, setCart] = useState<CartData>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { isCliente, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCliente || !isAuthenticated) return;
    load();
  }, [isCliente, isAuthenticated]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await cartApi.get();
      const data = res.data ?? res;
      setCart({
        items: data.items || [],
        total: data.total || 0,
      });
    } catch (err: any) {
      console.error("Erro ao carregar carrinho:", err);
      toast.error(
        err?.response?.data?.message || "Erro ao carregar carrinho."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await cartApi.remove(productId);
      toast.success("Item removido do carrinho.");
      load();
    } catch (err: any) {
      console.error("Erro ao remover item:", err);
      toast.error(
        err?.response?.data?.message || "Erro ao remover item do carrinho."
      );
    }
  };

  const handleClear = async () => {
    try {
      await cartApi.clear();
      toast.success("Carrinho esvaziado.");
      load();
    } catch (err: any) {
      console.error("Erro ao esvaziar carrinho:", err);
      toast.error(
        err?.response?.data?.message || "Erro ao esvaziar carrinho."
      );
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const res = await orderApi.checkout();
      const data = res.data ?? res;
      const order = data.order ?? data;

      toast.success("Pedido criado com sucesso!");

      if (order?._id) {
        navigate(`/pagamento?orderId=${order._id}`);
      } else {
        load();
      }
    } catch (err: any) {
      console.error("Erro ao finalizar compra:", err);
      toast.error(
        err?.response?.data?.message || "Erro ao finalizar compra."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isAuthenticated || !isCliente) {
    return (
      <ClienteLayout>
        <div className="p-6">
          <p>Somente clientes autenticados podem ver o carrinho.</p>
        </div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-2">Seu carrinho</h1>
        <p className="text-muted-foreground mb-4">
          Revise os itens antes de finalizar a compra.
        </p>

        {loading && <p>Carregando carrinho...</p>}

        {!loading && cart.items.length === 0 && (
          <p className="text-muted-foreground">
            Seu carrinho está vazio. Adicione produtos na página da loja.
          </p>
        )}

        {!loading && cart.items.length > 0 && (
          <>
            <div className="space-y-3">
              {cart.items.map((it, idx) => {
                const product =
                  typeof it.productId === "string"
                    ? { _id: it.productId, title: "Produto", price: it.unitPrice }
                    : it.productId;

                const id = product._id;
                const title = product.title;
                const unitPrice = it.unitPrice ?? product.price ?? 0;
                const subtotal = unitPrice * it.qty;

                return (
                  <Card key={id || idx}>
                    <CardContent className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              Sem imagem
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{title}</div>
                          <div className="text-sm text-muted-foreground">
                            Qtd: {it.qty} · Unit: R$ {unitPrice.toFixed(2)}
                          </div>
                          <div className="text-sm font-medium">
                            Subtotal: R$ {subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(id)}
                      >
                        Remover
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={handleClear}>
                Esvaziar carrinho
              </Button>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Total:
                </div>
                <div className="text-2xl font-bold">
                  R$ {Number(cart.total).toFixed(2)}
                </div>
                <Button
                  className="mt-2 w-full"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Finalizando..." : "Finalizar compra"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ClienteLayout>
  );
};

export default Carrinho;
