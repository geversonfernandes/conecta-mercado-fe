import React, { useEffect, useState } from "react";
import { productApi } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

const EditarProduto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { isVendedor } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await productApi.get(id);
        setProduct(r.data ?? r);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar produto");
      }
    })();
  }, [id]);

  if (!isVendedor) return <p>Somente vendedores podem editar.</p>;
  if (!product) return <p>Carregando...</p>;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleRemoveImage = async (img:any) => {
    if (!confirm("Remover imagem?")) return;
    try {
      await productApi.deleteImage(id!, img.publicId);
      setProduct((p:any) => ({ ...p, images: p.images.filter((x:any) => x.publicId !== img.publicId) }));
      toast.success("Imagem removida");
    } catch (err:any) {
      console.error(err);
      toast.error("Erro ao remover imagem");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const priceNumber = parsePriceStringToNumber(String(product.price ?? ''));
      if (isNaN(priceNumber)) {
        toast.error('Preço inválido');
        setLoading(false);
        return;
      }

      const requestedStatus = product.status === 'sem_estoque' ? 'sem_estoque' : product.status;

      const body: any = {
        title: product.title,
        description: product.description,
        price: priceNumber,
        stock: Number(product.stock) || 0,
        category: product.category,
        status: requestedStatus === 'sem_estoque' ? undefined : requestedStatus
      };

      await productApi.update(id!, body);

      if (files.length) {
        await productApi.uploadImages(id!, files);
      }

      toast.success("Atualizado com sucesso");
      navigate("/vendedor/produtos");
    } catch (err:any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      <h2 className="text-2xl font-semibold">Editar Produto</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={product.title} onChange={(e) => setProduct({ ...product, title: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Preço</Label>
          <Input value={String(product.price ?? '')} onChange={(e) => setProduct({ ...product, price: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Estoque</Label>
          <Input value={String(product.stock ?? 0)} onChange={(e) => setProduct({ ...product, stock: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={5} />
      </div>

      <div className="space-y-2">
        <Label>Imagens</Label>
        <div className="flex gap-4 items-start flex-wrap">
          {product.images?.map((img:any) => (
            <div key={img.publicId} className="space-y-1">
              <img src={img.url} alt="" style={{ width: 120, height: 90, objectFit: 'cover' }} />
              <div className="flex gap-2">
                <Button onClick={() => handleRemoveImage(img)} variant="outline">Remover</Button>
              </div>
            </div>
          ))}
        </div>
        <input type="file" multiple onChange={handleFiles} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label>Status</Label>
          <select
            value={product.status}
            onChange={(e) => setProduct({ ...product, status: e.target.value })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="anunciado">Anunciado</option>
            <option value="desativado">Desativado</option>
            <option value="sem_estoque" disabled>Sem estoque (automático)</option>
          </select>
          <div className="text-sm text-muted-foreground mt-1">
            {product.status === 'sem_estoque' ? 'Produto sem estoque — atualize o estoque para reativar.' : ''}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => navigate('/vendedor/produtos')}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>
    </div>
  );
};

export default EditarProduto;
