// Types compartilhados entre frontend e backend
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

export interface User {
  usuarioID: number;
  nomeCompleto: string;
  cpf: string;
  nomeGrupo: string;
  adm: boolean;
  // Compatibilidade com interface antiga
  id?: number;
  name?: string;
  group?: string;
  isAdmin?: boolean;
}

export interface LoggedUser {
  usuarioID: number;
  nomeCompleto: string;
  cpf: string;
  grupoID?: number;
  nomeGrupo?: string;
  adm: boolean;
}

export interface ProgressImage {
  imagemID: number;
  caminhoImagem: string;
  porcentagem: number;
  dataEnvio?: string;
  createdAt?: Date;
}

export interface Project {
  projetoID: number;
  nomeProjeto: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  imagemInicial?: string;
  imagensProgresso?: ProgressImage[];
  // Compatibilidade com interface antiga
  id?: string;
  name?: string;
  location?: string;
  progress?: number;
}

export interface AddProjectRequest {
  nomeProjeto: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  nomeGrupo: string;
  imagemInicial: File;
}