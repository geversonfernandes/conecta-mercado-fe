import { useEffect, useState } from "react";
import { ClienteLayout } from "@/components/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orderApi } from "../../api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type OrderItem = {
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
};

type Order = {
  _id: string;
  total: number;
  status: "pendente" | "pago" | "em_transito" | "entregue" | "cancelado";
  createdAt: string;
  items: OrderItem[];
};

type Filter = "todos" | "pendente" | "pago";

export default function PedidosCliente() {
  const { isCliente, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("todos");

  useEffect(() => {
    if (!isAuthenticated || !isCliente) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.list();
        const data = res.data ?? res;
        const list: Order[] = data.orders ?? data ?? [];
        setOrders(list);
      } catch (err: any) {
        console.error("Erro ao carregar pedidos:", err);
        setError(err?.response?.data?.message || "Erro ao carregar pedidos.");
        toast.error(err?.response?.data?.message || "Erro ao carregar pedidos.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isCliente]);

  if (!isAuthenticated || !isCliente) {
    return (
      <ClienteLayout>
        <div className="p-6">
          <p>Somente clientes autenticados podem ver seus pedidos.</p>
        </div>
      </ClienteLayout>
    );
  }

  const filteredOrders =
    filter === "todos"
      ? orders
      : orders.filter((o) => o.status === filter);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pendente":
        return <Badge className="bg-yellow-400 text-black">Pendente</Badge>;
      case "pago":
        return <Badge className="bg-green-600 text-white">Pago</Badge>;
      case "em_transito":
        return <Badge className="bg-blue-500 text-white">Em trânsito</Badge>;
      case "entregue":
        return <Badge className="bg-emerald-600 text-white">Entregue</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ClienteLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Meus pedidos</h1>
            <p className="text-muted-foreground">
              Acompanhe aqui seus pedidos pendentes, pagos e entregues.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("todos")}
            >
              Todos
            </Button>
            <Button
              variant={filter === "pendente" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pendente")}
            >
              Pendentes
            </Button>
            <Button
              variant={filter === "pago" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pago")}
            >
              Pagos
            </Button>
          </div>
        </div>

        {loading && <p>Carregando pedidos...</p>}

        {error && (
          <p className="text-sm text-destructive">
            Erro ao carregar pedidos: {error}
          </p>
        )}

        {!loading && filteredOrders.length === 0 && !error && (
          <p className="text-muted-foreground">
            Você ainda não possui pedidos neste filtro.
          </p>
        )}

        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const created = order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "";

            const shortId = order._id?.slice(-6) || order._id;

            return (
              <Card key={order._id}>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base md:text-lg">
                      Pedido #{shortId}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Realizado em {created}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(order.status)}
                    <div className="text-sm font-semibold">
                      Total: R$ {Number(order.total).toFixed(2)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Itens do pedido
                  </p>
                  <div className="space-y-1">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>
                          {it.title}{" "}
                          <span className="text-xs">x{it.qty}</span>
                        </span>
                        <span>
                          R$ {Number(it.unitPrice * it.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ClienteLayout>
  );
}
