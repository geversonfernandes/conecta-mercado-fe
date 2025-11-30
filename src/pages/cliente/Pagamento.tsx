import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ClienteLayout } from "@/components/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { paymentApi } from "../../api";
import { toast } from "sonner";
import { ArrowLeft, Clipboard, CheckCircle2, RefreshCcw } from "lucide-react";

type PaymentData = {
  paymentId: string;
  orderId: string;
  amount: number;
  pix: {
    qrCode: string;
    copyPaste: string;
  };
  expiresAt: string | number;
};

const Pagamento: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [status, setStatus] = useState<"pending" | "paid" | "failed" | "unknown">("unknown");
  const [loadingPix, setLoadingPix] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) return;

    const createPix = async () => {
      try {
        setLoadingPix(true);
        const res = await paymentApi.createPix(orderId);
        const data = res.data ?? res;

        setPayment(data);
        setStatus("pending");
      } catch (err: any) {
        console.error("Erro ao gerar PIX:", err);
        toast.error(err?.response?.data?.message || "Erro ao gerar pagamento PIX.");
      } finally {
        setLoadingPix(false);
      }
    };

    createPix();
  }, [orderId]);

  const handleCopyCode = async () => {
    if (!payment?.pix?.copyPaste) return;
    try {
      await navigator.clipboard.writeText(payment.pix.copyPaste);
      toast.success("Código PIX copiado para a área de transferência!");
    } catch {
      toast.error("Não foi possível copiar o código PIX.");
    }
  };

  const handleCheckStatus = async () => {
    if (!orderId) return;
    try {
      setCheckingStatus(true);
      const res = await paymentApi.status(orderId);
      const data = res.data ?? res;
      const s = data.status as "pending" | "paid" | "failed" | string;
      setStatus(s === "paid" ? "paid" : s === "failed" ? "failed" : "pending");
      toast.info(`Status do pagamento: ${data.status}`);
    } catch (err: any) {
      console.error("Erro ao consultar status:", err);
      toast.error(err?.response?.data?.message || "Erro ao consultar status do pagamento.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!payment || !orderId) return;
    try {
      setSimulating(true);
      const payload = {
        paymentId: payment.paymentId,
        orderId,
        status: "paid",
        txid: `SIMULATED-${payment.paymentId}`,
      };

      await paymentApi.webhook(payload);
      toast.success("Webhook simulado com sucesso. Pagamento marcado como 'paid'.");

      await handleCheckStatus();
    } catch (err: any) {
      console.error("Erro ao simular webhook:", err);
      toast.error(err?.response?.data?.message || "Erro ao simular webhook.");
    } finally {
      setSimulating(false);
    }
  };

  if (!orderId) {
    return (
      <ClienteLayout>
        <div className="p-6 max-w-xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => navigate("/carrinho")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o carrinho
          </Button>
          <p>Pedido inválido. Volte ao carrinho e tente novamente.</p>
        </div>
      </ClienteLayout>
    );
  }

  const renderStatusBadge = () => {
    if (status === "paid") {
      return <Badge className="bg-green-600 text-white">Pago</Badge>;
    }
    if (status === "failed") {
      return <Badge variant="destructive">Falhou</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-yellow-400 text-black">Pendente</Badge>;
    }
    return <Badge variant="outline">Desconhecido</Badge>;
  };

  const expiration =
    payment?.expiresAt
      ? new Date(payment.expiresAt).toLocaleString()
      : "";

  return (
    <ClienteLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/carrinho")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o carrinho
        </Button>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Pagamento PIX</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Use o código PIX abaixo para realizar o pagamento do seu pedido.
              </p>
            </div>
            <div>{renderStatusBadge()}</div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loadingPix && <p>Gerando PIX...</p>}

            {payment && (
              <>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">ID do pagamento</div>
                  <div className="font-mono text-sm break-all">
                    {payment.paymentId}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Valor</div>
                  <div className="text-2xl font-bold text-primary">
                    R$ {Number(payment.amount).toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Pix copia e cola</div>
                  <div className="bg-muted rounded-md p-3 text-xs font-mono break-all">
                    {payment.pix.copyPaste}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={handleCopyCode}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copiar código PIX
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">QR Code (simulado)</div>
                  <div className="bg-muted rounded-md p-3 text-xs font-mono break-all">
                    {payment.pix.qrCode}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aqui poderia ser exibida uma imagem de QR Code real, integrada a um provedor de pagamentos.
                  </p>
                </div>

                {expiration && (
                  <div className="text-xs text-muted-foreground">
                    Expira em: <span className="font-medium">{expiration}</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                    className="flex-1"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    {checkingStatus ? "Verificando..." : "Verificar status"}
                  </Button>

                  <Button
                    onClick={handleSimulateWebhook}
                    disabled={simulating || status === "paid"}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {simulating ? "Simulando..." : "Simular pagamento (webhook)"}
                  </Button>
                </div>

                {status === "paid" && (
                  <div className="pt-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-md p-3">
                    Pagamento confirmado! Seu pedido foi marcado como pago.  
                    Você pode acompanhar os pedidos em uma tela de histórico (quando você criar essa página 😉).
                  </div>
                )}
              </>
            )}

            {!loadingPix && !payment && (
              <p className="text-muted-foreground">
                Não foi possível carregar os dados do pagamento. Volte ao carrinho e tente novamente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ClienteLayout>
  );
};

export default Pagamento;
