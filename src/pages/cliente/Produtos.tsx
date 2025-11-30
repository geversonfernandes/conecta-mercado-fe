import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClienteLayout } from "@/components/ClienteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { productApi, cartApi } from "../../api";
import { useAuth } from "@/contexts/AuthContext";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: { url: string; publicId?: string }[];
  status: "anunciado" | "sem_estoque" | "desativado";
  category?: string;
  stock?: number;
};

export default function ProdutosCliente() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { isCliente, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadProducts = async (opts?: { page?: number; search?: string }) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = opts?.page ?? page;
      const searchParam = opts?.search ?? search.trim();

      const params: any = { page: currentPage, limit: 9 };
      if (searchParam) params.search = searchParam;

      const res = await productApi.list(params);
      const data = res.data ?? res;

      const items: Product[] = data.items ?? [];
      setProducts(items);
      setPage(data.page ?? currentPage);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? items.length);
    } catch (err: any) {
      console.error("Erro ao carregar produtos:", err);
      setError(err?.response?.data?.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts({ page: 1 });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts({ page: 1, search: search.trim() });
  };

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pages) return;
    setPage(nextPage);
    loadProducts({ page: nextPage });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleAddToCart = async (productId: string) => {
    try {
      if (!isAuthenticated || !isCliente) {
        toast.error("Faça login como cliente para adicionar ao carrinho.");
        navigate("/");
        return;
      }

      const qty = quantities[productId] || 1;
      await cartApi.add(productId, qty);
      toast.success("Produto adicionado ao carrinho!");
    } catch (err: any) {
      console.error("Erro ao adicionar ao carrinho:", err);
      toast.error(
        err?.response?.data?.message ||
          "Erro ao adicionar produto ao carrinho."
      );
    }
  };

  return (
    <ClienteLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Loja de produtos</h1>
              <p className="text-muted-foreground">
                Veja os produtos disponíveis para compra.
              </p>
            </div>

            <Link
              to="/pedidos"
              className="flex items-center gap-2 text-primary hover:underline text-sm"
            >
              <PackageSearch className="h-5 w-5" />
              Meus pedidos
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos por nome ou descrição"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-24"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              Buscar
            </Button>
          </form>

          {loading && (
            <p className="mt-4 text-sm text-muted-foreground">
              Carregando produtos...
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-destructive">Erro: {error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!loading && products.length === 0 && !error && (
            <p className="text-muted-foreground col-span-full">
              Nenhum produto encontrado.
            </p>
          )}

          {products.map((product) => {
            const quantity = quantities[product._id] || 1;
            const stock = product.stock ?? 0;
            const isAvailable =
              product.status === "anunciado" && stock > 0;

            const statusLabel =
              product.status === "anunciado"
                ? stock > 0
                  ? "Disponível"
                  : "Sem estoque"
                : product.status === "sem_estoque"
                ? "Sem estoque"
                : "Desativado";

            const statusClasses =
              product.status === "anunciado" && stock > 0
                ? "bg-green-100 text-green-800"
                : product.status === "desativado"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-800";

            return (
              <Card
                key={product._id}
                className={`overflow-hidden ${
                  !isAvailable ? "opacity-85" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate(`/produtos/${product._id}`)}
                  >
                    <div className="w-20 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={product.images?.[0]?.url || "/placeholder.png"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base">
                            {product.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {product.description || "Sem descrição."}
                          </p>
                        </div>
                        <span className="text-base font-bold text-primary whitespace-nowrap">
                          R${" "}
                          {Number(product.price || 0)
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <Badge
                          className={`text-[10px] px-2 py-0.5 rounded-full ${statusClasses}`}
                        >
                          {statusLabel.toUpperCase()}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground">
                          Estoque:{" "}
                          <span
                            className={
                              stock > 0 ? "" : "text-destructive font-medium"
                            }
                          >
                            {stock > 0 ? stock : "indisponível"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <div className="flex items-center bg-primary/10 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(product._id, -1)
                        }
                        className="h-8 px-2"
                        disabled={!isAvailable}
                      >
                        -
                      </Button>
                      <span className="px-4 text-sm font-medium">
                        Quantidade: {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(product._id, 1)
                        }
                        className="h-8 px-2"
                        disabled={!isAvailable}
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product._id)}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={!isAvailable}
                    >
                      {isAvailable
                        ? "Adicionar ao carrinho"
                        : "Indisponível"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Paginação */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando página {page} de {pages} — {total} produto(s)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChangePage(page - 1)}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChangePage(page + 1)}
                disabled={page >= pages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
