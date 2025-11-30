import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Lock } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [role, setRole] = useState<'vendedor' | 'cliente'>('vendedor');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role);
      toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border">
        
        <div className="flex items-center justify-center mb-6">
          <Logo />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">
          Criar Conta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label htmlFor="name">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* === Escolha entre Cliente e Vendedor (mutuamente exclusiva) === */}
          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id="role-cliente"
                checked={role === 'cliente'}
                onCheckedChange={(checked) => setRole(checked ? 'cliente' : 'vendedor')}
              />
              <span className="select-none">Cliente</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id="role-vendedor"
                checked={role === 'vendedor'}
                onCheckedChange={(checked) => setRole(checked ? 'vendedor' : 'cliente')}
              />
              <span className="select-none">Vendedor</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base"
          >
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </Button>
        </form>

        <p className="text-sm text-center mt-4">
          Já possui conta?{' '}
          <a href="/" className="text-blue-600 hover:underline">
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}
