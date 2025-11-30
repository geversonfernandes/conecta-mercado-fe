import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { productApi } from "../../api";
import { useAuth } from "@/contexts/AuthContext";

const parsePriceStringToNumber = (s: string) => {
  if (!s && s !== "0") return NaN;
  const cleaned = s.replace(/\s/g, "").replace(/[R$\u00A0]/g, "").replace(",", ".");
  const firstPointIndex = cleaned.indexOf(".");
  const normalized = firstPointIndex >= 0
    ? cleaned.slice(0, firstPointIndex + 1) + cleaned.slice(firstPointIndex + 1).replace(/\./g, "")
    : cleaned;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : NaN;
};

const NovoProduto: React.FC = () => {
  const navigate = useNavigate();
  const { isVendedor } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isVendedor) return <p>Somente vendedores podem criar produtos.</p>;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const priceNumber = parsePriceStringToNumber(price);
      if (isNaN(priceNumber)) {
        toast.error("Preço inválido. Use formato 5.50 ou 5,50");
        setLoading(false);
        return;
      }

      const res = await productApi.create({
        title,
        description,
        price: priceNumber,
        stock: Number(stock) || 0,
        category,
        status: 'anunciado'
      });
      const product = res.data?.product ?? res.data ?? res;
      if (files.length > 0 && product?._id) {
        await productApi.uploadImages(product._id, files);
      }
      toast.success("Produto cadastrado com sucesso!");
      navigate("/vendedor/produtos");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erro ao cadastrar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/vendedor/produtos")} className="mb-4 -ml-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div>
        <h1 className="text-4xl font-bold mb-2">Novo produto</h1>
        <p className="text-muted-foreground">Cadastre um produto para venda no marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-muted/30 flex items-center justify-center min-h-[320px]">
          <CardContent className="text-center py-6">
            <ImagePlus className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Selecione a imagem do produto
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="mt-4"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              {files.length} arquivo(s) selecionado(s)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6">Dados do produto</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="uppercase text-xs text-muted-foreground">Título</Label>
                  <Input id="title" placeholder="Nome do produto" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="uppercase text-xs text-muted-foreground">Valor</Label>
                  <Input id="price" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="uppercase text-xs text-muted-foreground">Descrição</Label>
                <Textarea id="description" placeholder="Escreva detalhes sobre o produto" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="uppercase text-xs text-muted-foreground">Categoria</Label>
                  <Input id="category" placeholder="ex: frutas" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="uppercase text-xs text-muted-foreground">Estoque</Label>
                  <Input id="stock" placeholder="0" value={stock as any} onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/vendedor/produtos")}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar e publicar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoProduto;
