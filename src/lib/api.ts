const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'vendedor' | 'cliente';
}

interface AuthResponse {
  token: string;
  usuario: User;
}

interface Product {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  imagem_url: string;
  status: 'anunciado' | 'vendido' | 'desativado';
}

interface OrderItem {
  produto_id: string;
  quantidade: number;
}

interface Order {
  id: string;
  cliente_id: string;
  itens: OrderItem[];
  frete: number;
  total: number;
}

interface PixPayment {
  chave_pix: string;
  qrcode_base64: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers as HeadersInit);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, senha: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.usuario));
    return response;
  }

  async register(
    nome: string,
    email: string,
    senha: string,
    tipo: 'vendedor' | 'cliente'
  ): Promise<void> {
    await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, tipo }),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Products
  async getProducts(nome?: string): Promise<Product[]> {
    const query = nome ? `?nome=${encodeURIComponent(nome)}` : '';
    return this.request<Product[]>(`/products${query}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'total'>): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async generatePixPayment(orderId: string): Promise<PixPayment> {
    return this.request<PixPayment>(`/orders/${orderId}/payment`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
export type { User, Product, Order, OrderItem, PixPayment };
