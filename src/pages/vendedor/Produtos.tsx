import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { productApi } from "../../api";
import { useAuth } from "@/contexts/AuthContext";

type Product = {
  _id?: string;
  title?: string;
  price?: number;
  stock?: number;
  images?: any[];
  category?: string;
  status?: string;
};

const ProdutosVendedor: React.FC = () => {
  const navigate = useNavigate();
  const { isVendedor, user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!isVendedor || !user?.id) return;
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.listByVendor(user.id);
      const data = res.data?.items ?? res.data ?? res;
      setItems(data);
    } catch (err: any) {
      console.error("Erro ao listar produtos:", err);
      setError(err?.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };
  load();
}, [isVendedor, user?.id]);

  if (!isVendedor) return <p>Somente vendedores podem acessar.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Produtos</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus anúncios</p>
        </div>

        {/* botão de cadastrar, sempre visível */}
        <div>
          <Button onClick={() => navigate("/vendedor/produtos/novo")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Cadastrar produto
          </Button>
        </div>
      </div>

      {loading && <p>Carregando produtos...</p>}
      {error && <div className="text-destructive">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.length === 0 && !loading ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Nenhum produto encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Você ainda não cadastrou produtos. Clique em "Cadastrar produto".</p>
            </CardContent>
          </Card>
        ) : (
          items.map((p) => (
            <Card key={p._id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">{p.category ?? "—"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div style={{ width: 72, height: 72 }} className="bg-muted/20 rounded-md overflow-hidden">
                    <img src={p.images?.[0]?.url || "/placeholder.png"} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm text-muted-foreground">R$ {Number(p.price).toFixed(2)}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs mt-1 ${p.status === 'anunciado' ? 'bg-green-100 text-green-800' : p.status === 'sem_estoque' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.status === 'sem_estoque' ? 'Sem estoque' : p.status === 'desativado' ? 'Desativado' : 'Anunciado'}
                      </span>
                      <button className="text-sm text-primary underline" onClick={() => navigate(`/vendedor/produtos/editar/${p._id}`)}>Editar</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProdutosVendedor;
