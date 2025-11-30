import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "../../api";

type OrderItem = {
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
};

type Order = {
  _id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
  buyerId: string;
};

export default function MinhasVendas() {
  const { isVendedor } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVendedor) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await orderApi.list();
        const data = res.data ?? res;
        const list: Order[] = data.orders ?? data ?? [];
        setOrders(list);
      } catch (err) {
        console.error("Erro ao carregar vendas:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isVendedor]);

  if (!isVendedor) return <p>Somente vendedores podem acessar.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Minhas vendas</h1>
      <p className="text-muted-foreground">
        Veja os pedidos feitos nos seus produtos.
      </p>

      {loading && <p>Carregando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((o) => {
          const created = o.createdAt
            ? new Date(o.createdAt).toLocaleString()
            : "";

          return (
            <Card key={o._id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Pedido #{o._id.slice(-6)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{created}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Status:</strong> {o.status}
                </p>
                <p>
                  <strong>Total:</strong> R$ {Number(o.total).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cliente (id): {o.buyerId}
                </p>

                <div className="mt-3">
                  <strong>Itens:</strong>
                  <ul className="list-disc ml-4 text-sm mt-1 space-y-1">
                    {o.items.map((it, idx) => (
                      <li key={idx}>
                        {it.title} — {it.qty}x (R${" "}
                        {Number(it.unitPrice).toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!loading && orders.length === 0 && (
          <p className="text-muted-foreground">
            Você ainda não possui vendas registradas.
          </p>
        )}
      </div>
    </div>
  );
}
