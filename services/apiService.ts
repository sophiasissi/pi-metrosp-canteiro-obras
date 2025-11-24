// Configuração da API
const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Endereço do backend Flask

export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  message: string;
  usuario: {
    usuarioID: number;
    nomeCompleto: string;
    cpf: string;
    grupoID: number;
    adm: boolean;
  };
}

export interface RegisterRequest {
  nomeCompleto: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
  nomeGrupo: string;
  adm?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface AddProjectRequest {
  nomeProjeto: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  nomeGrupo: string;
  imagemInicial: File;
}

export interface Project {
  projetoID: number;
  nomeProjeto: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  imagemInicial: string;
  imagensProgresso: ProgressImage[];
}

export interface ProgressImage {
  imagemID: number;
  caminhoImagem: string;
  porcentagem: number;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Erro desconhecido',
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão',
        status: 0,
      };
    }
  }

  // Login do usuário
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Registro de usuário
  async register(userData: RegisterRequest): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Buscar informações do usuário
  async getUserInfo(cpf: string): Promise<ApiResponse<{
    cpf: string;
    nomeCompleto: string;
    nomeGrupo: string;
    adm: boolean;
  }>> {
    return this.makeRequest(`/user/settings/show-info/${cpf}`, {
      method: 'GET',
    });
  }

  // Atualizar informações do usuário
  async updateUserInfo(userData: any): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('/user/settings/change-info', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Testar conexão com o backend
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch('http://127.0.0.1:5000/');
      const data = await response.json();
      
      return {
        success: response.ok,
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Backend não está respondendo',
        status: 0,
      };
    }
  }

  // Adicionar projeto
  async addProject(formData: FormData): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/add`, {
        method: 'POST',
        body: formData, // FormData para upload de arquivo
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Erro desconhecido',
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão',
        status: 0,
      };
    }
  }

  // Buscar projeto por ID
  async getProject(projetoID: number): Promise<ApiResponse<Project>> {
    return this.makeRequest<Project>(`/projects/show/${projetoID}`, {
      method: 'GET',
    });
  }

  // Remover projeto
  async removeProject(projetoID: number): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/projects/remove/${projetoID}`, {
      method: 'DELETE',
    });
  }

  // Atualizar projeto
  async updateProject(projetoID: number, data: { dataFim: string }): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/projects/change/${projetoID}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Upload de imagem de progresso
  async uploadProgressImage(projetoID: number, formData: FormData): Promise<ApiResponse<{ message: string; porcentagem: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/upload/${projetoID}`, {
        method: 'POST',
        body: formData, // FormData para upload de arquivo
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Erro desconhecido',
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão',
        status: 0,
      };
    }
  }
}

export const apiService = new ApiService();