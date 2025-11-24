// Configuração da API
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Project,
  RegisterRequest,
} from "../types/api";

const API_BASE_URL = "http://127.0.0.1:5000/api"; // Endereço do backend Flask

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
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
          error: data.message || "Erro desconhecido",
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão",
        status: 0,
      };
    }
  }

  // Login do usuário
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>("/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Registro de usuário
  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Buscar informações do usuário
  async getUserInfo(cpf: string): Promise<
    ApiResponse<{
      cpf: string;
      nomeCompleto: string;
      nomeGrupo: string;
      adm: boolean;
    }>
  > {
    return this.makeRequest(`/user/settings/show-info/${cpf}`, {
      method: "GET",
    });
  }

  // Atualizar informações do usuário
  async updateUserInfo(
    userData: any
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest("/user/settings/change-info", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // Testar conexão com o backend
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch("http://127.0.0.1:5000/");
      const data = await response.json();

      return {
        success: response.ok,
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: "Backend não está respondendo",
        status: 0,
      };
    }
  }

  // Adicionar projeto
  async addProject(
    formData: FormData
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/add`, {
        method: "POST",
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
          error: data.message || "Erro desconhecido",
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão",
        status: 0,
      };
    }
  }

  // Buscar projeto por ID
  async getProject(projetoID: number): Promise<ApiResponse<Project>> {
    return this.makeRequest<Project>(`/projects/show/${projetoID}`, {
      method: "GET",
    });
  }

  // Buscar todos os projetos (opcionalmente por grupo)
  async getProjects(
    nomeGrupo?: string
  ): Promise<ApiResponse<{ projetos: Project[] }>> {
    const query = nomeGrupo
      ? `?nomeGrupo=${encodeURIComponent(nomeGrupo)}`
      : "";
    return this.makeRequest<{ projetos: Project[] }>(`/projects${query}`, {
      method: "GET",
    });
  }

  // Remover projeto
  async removeProject(
    projetoID: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      `/projects/remove/${projetoID}`,
      {
        method: "DELETE",
      }
    );
  }

  // Remover imagem de progresso
  async removeProgressImage(
    imagemID: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      `/progress/delete/${imagemID}`,
      {
        method: "DELETE",
      }
    );
  }

  // Atualizar projeto
  async updateProject(
    projetoID: number,
    data: { dataFim: string }
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      `/projects/change/${projetoID}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Upload de imagem de progresso
  async uploadProgressImage(
    projetoID: number,
    formData: FormData
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/upload/${projetoID}`,
        {
          method: "POST",
          body: formData, // FormData para upload de arquivo
        }
      );

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
          error: data.message || "Erro desconhecido",
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão",
        status: 0,
      };
    }
  }

  // Buscar todos os grupos disponíveis
  async getGroups(): Promise<
    ApiResponse<{ grupos: { grupoID: number; nomeGrupo: string }[] }>
  > {
    return this.makeRequest<{
      grupos: { grupoID: number; nomeGrupo: string }[];
    }>("/groups", {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
