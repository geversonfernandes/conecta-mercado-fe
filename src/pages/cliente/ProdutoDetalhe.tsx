import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClienteLayout } from "@/components/ClienteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { productApi, cartApi } from "../../api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ProductDetail = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images?: { url: string; publicId?: string }[];
  status: "anunciado" | "sem_estoque" | "desativado";
  category?: string;
  stock?: number;
  vendorId?: { name?: string; email?: string };
};

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCliente, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await productApi.get(id);
        const data = res.data ?? res;
        setProduct(data);
      } catch (err: any) {
        console.error("Erro ao carregar produto:", err);
        toast.error(
          err?.response?.data?.message || "Erro ao carregar detalhes do produto"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      if (!isAuthenticated || !isCliente) {
        toast.error("Faça login como cliente para adicionar ao carrinho.");
        navigate("/");
        return;
      }
      setAdding(true);
      await cartApi.add(product._id, 1);
      toast.success("Produto adicionado ao carrinho!");
    } catch (err: any) {
      console.error("Erro ao adicionar ao carrinho:", err);
      toast.error(
        err?.response?.data?.message ||
          "Erro ao adicionar produto ao carrinho."
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <ClienteLayout>
        <div className="p-6">Carregando produto...</div>
      </ClienteLayout>
    );
  }

  if (!product) {
    return (
      <ClienteLayout>
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/produtos")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para produtos
          </Button>
          <p>Produto não encontrado.</p>
        </div>
      </ClienteLayout>
    );
  }

  const stock = product.stock ?? 0;
  const isAvailable = product.status === "anunciado" && stock > 0;
  const statusLabel =
    product.status === "anunciado"
      ? stock > 0
        ? "Disponível"
        : "Sem estoque"
      : product.status === "sem_estoque"
      ? "Sem estoque"
      : "Desativado";

  return (
    <ClienteLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/produtos")}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para produtos
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="bg-muted/40">
            <CardContent className="p-4 flex items-center justify-center min-h-[280px]">
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.title}
                className="max-h-80 w-full object-contain rounded-lg"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">{product.title}</h1>
                {product.category && (
                  <p className="text-sm text-muted-foreground">
                    Categoria: {product.category}
                  </p>
                )}
                {product.vendorId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Vendedor: {product.vendorId.name} (
                    {product.vendorId.email})
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  R${" "}
                  {Number(product.price || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </div>
                <Badge
                  variant="outline"
                  className={`mt-2 ${
                    !isAvailable ? "bg-yellow-100 text-yellow-800" : ""
                  }`}
                >
                  {statusLabel}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Estoque:{" "}
                  <span className={stock > 0 ? "" : "text-destructive"}>
                    {stock > 0 ? stock : "indisponível"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold text-lg">Descrição</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {product.description || "Sem descrição fornecida."}
              </p>
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={handleAddToCart}
                disabled={!isAvailable || adding}
              >
                {isAvailable
                  ? adding
                    ? "Adicionando..."
                    : "Adicionar ao carrinho"
                  : "Indisponível para compra"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ClienteLayout>
  );
}
