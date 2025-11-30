import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Package, Users, Calendar } from "lucide-react";
import { vendorApi } from "../../api";
import { useAuth } from "@/contexts/AuthContext";

type RecentOrderItem = {
  productId: string;
  title?: string;
  qty: number;
  unitPrice: number;
};

type RecentOrder = {
  orderId: string;
  createdAt: string;
  status: string;
  total: number;
  items?: RecentOrderItem[];
  buyer?: { name?: string; email?: string };
};

type Last7Day = {
  label: string;
  revenue: number;
  ordersCount: number;
};

type DashboardData = {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  topProducts?: Array<{ productId: string; title: string; qtySold: number; revenue: number }>;
  recentOrders?: RecentOrder[];
  last7Days?: Last7Day[];
};

export default function Dashboard() {
  const { isVendedor } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mockStats = {
    produtosVendidos: 0,
    produtosAnunciados: 0,
    pessoasVisitantes: 0,
  };

  useEffect(() => {
    if (!isVendedor) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await vendorApi.dashboard();
        setData(r?.data ?? r);
      } catch (err: any) {
        console.error("Erro ao carregar dashboard:", err);
        setError(err?.response?.data?.message || err?.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isVendedor]);

  if (!isVendedor) {
    return (
      <div className="p-6">
        <p>Somente vendedores.</p>
      </div>
    );
  }

  const totalProducts = data?.totalProducts ?? mockStats.produtosAnunciados;
  const totalOrders = data?.totalOrders ?? mockStats.produtosVendidos;
  const pendingOrders = data?.pendingOrders ?? 0;
  const revenue = data?.revenue ?? 0;

  const chartData = useMemo(() => {
    if (!data?.last7Days) return [];
    return data.last7Days;
  }, [data?.last7Days]);

  const svgConfig = useMemo(() => {
    if (!chartData.length) return { points: "", polygonPoints: "" };

    const width = 800;
    const height = 260;
    const paddingTop = 20;
    const paddingBottom = 20;

    const maxValue =
      chartData.reduce((max, p) => (p.revenue > max ? p.revenue : max), 0) || 1;

    const n = chartData.length;
    const stepX = n > 1 ? width / (n - 1) : width / 2;

    const pointsArr: string[] = [];

    chartData.forEach((p, idx) => {
      const x = n > 1 ? idx * stepX : width / 2;
      const usableHeight = height - paddingTop - paddingBottom;
      const y =
        height -
        paddingBottom -
        (p.revenue / maxValue) * usableHeight;
      pointsArr.push(`${x},${y}`);
    });

    const points = pointsArr.join(" ");

    const firstX = pointsArr.length ? pointsArr[0].split(",")[0] : "0";
    const lastX = pointsArr.length
      ? pointsArr[pointsArr.length - 1].split(",")[0]
      : `${width}`;

    const polygonPoints = `${firstX},${height - paddingBottom} ${points} ${lastX},${height - paddingBottom}`;

    return { points, polygonPoints };
  }, [chartData]);

  const last7TotalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const last7TotalOrders = chartData.reduce((s, d) => s + d.ordersCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Últimos 30 dias</h1>
        <p className="text-muted-foreground">
          Confira as estatísticas da sua loja no último mês
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Tag className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-bold">
                {loading ? "..." : Number(totalOrders).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos anunciados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-bold">
                {loading ? "..." : Number(totalProducts).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pessoas visitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-4xl font-bold">
                {loading
                  ? "..."
                  : data
                  ? (data?.recentOrders?.length ?? 0)
                  : mockStats.pessoasVisitantes.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Receita por dia (últimos 7 dias)</CardTitle>
              {chartData.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Receita total: R$ {last7TotalRevenue.toFixed(2)} — Vendas:{" "}
                  {last7TotalOrders}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Últimos 7 dias
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {loading ? (
              <p>Carregando gráfico...</p>
            ) : !chartData.length ? (
              <p>Sem dados dos últimos 7 dias.</p>
            ) : (
              <div style={{ width: "100%", height: "100%" }}>
                <svg
                  viewBox="0 0 800 260"
                  preserveAspectRatio="none"
                  style={{ width: "100%", height: "100%" }}
                >
                  <defs>
                    <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#A5F3FC" stopOpacity="0.9" />
                      <stop
                        offset="1"
                        stopColor="#A5F3FC"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>

                  {/* Área preenchida */}
                  <polygon
                    fill="url(#g2)"
                    stroke="none"
                    points={svgConfig.polygonPoints}
                  />

                  {/* Linha da curva */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    points={svgConfig.points}
                  />
                </svg>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        {error && <div className="text-destructive">Erro: {error}</div>}
        {!error && !loading && (
          <div>
            <div>Total Pedidos: {data?.totalOrders ?? 0}</div>
            <div>Pedidos Pendentes: {pendingOrders}</div>
            <div>Receita: R$ {revenue.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
