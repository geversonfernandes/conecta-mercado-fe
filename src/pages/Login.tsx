import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      const stored = localStorage.getItem("user");
      const loggedUser = stored ? JSON.parse(stored) : null;

      if (loggedUser?.role === "vendedor") {
        navigate("/vendedor/dashboard", { replace: true });
      } else {
        navigate("/produtos", { replace: true });
      }
    } catch (err: any) {
      console.error("Erro no login:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo />
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2">Acesse sua conta</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="space-y-2">
                <Label htmlFor="email">email:</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu email cadastrado"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">senha:</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="sua senha cadastrada"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? 'Acessando...' : 'Acessar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Ainda não tem conta ?</p>
              <Button
                variant="outline"
                onClick={() => navigate('/cadastro')}
                className="w-full border-primary text-primary hover:bg-primary/5"
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 bg-muted items-center justify-center p-8">
        <div className="w-96 h-96 rounded-3xl bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl transform rotate-12 flex items-center justify-center">
          <div className="w-80 h-80 rounded-2xl bg-background/20 backdrop-blur-sm flex items-center justify-center transform -rotate-12">
            <div className="w-64 h-64 rounded-xl bg-gradient-to-br from-background/40 to-transparent transform rotate-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
