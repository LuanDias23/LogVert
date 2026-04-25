import axios, { AxiosResponse } from 'axios';

// ========================================================
// LOGVERT — Camada de Integração: Consumidor Service
// ========================================================

const API_BASE_URL = 'http://localhost:8080/logvert';
const CONSUMIDORES_ENDPOINT = `${API_BASE_URL}/consumidores`;

// ========================================================
// Interface — Tipagem exata do Consumidor
// ========================================================

export interface Consumidor {
  idConsumidor: number;
  nome: string;
  cpf_cnpj: string;
  email: string;
  celular: string;
  telefone?: string;
  endereco?: string;
  ativo?: boolean;
}

/** Payload usado no POST (criação) — SEM telefone */
export interface ConsumidorCreatePayload {
  nome: string;
  cpf_cnpj: string;
  email: string;
  celular: string;
  endereco: string;
}

/** Payload usado no PUT (atualização) — SEM endereco */
export interface ConsumidorUpdatePayload {
  nome: string;
  cpf_cnpj: string;
  email: string;
  celular: string;
  telefone: string;
}

// ========================================================
// Helper — Headers de Autenticação
// ========================================================

const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const getHeaders = () => {
  const token = getToken();
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// ========================================================
// Serviço de Consumidores (CRUD + Batch)
// ========================================================

const consumidorService = {

  /**
   * Listar Todos os Consumidores
   * GET /logvert/consumidores
   * @returns Array de objetos Consumidor
   */
  async listarTodos(): Promise<Consumidor[]> {
    const response: AxiosResponse<Consumidor[]> = await axios.get(
      CONSUMIDORES_ENDPOINT,
      { headers: getHeaders() }
    );
    return response.data;
  },

  /**
   * Buscar Consumidor por ID
   * GET /logvert/consumidores/{id}
   * @param id - ID do consumidor
   */
  async buscarPorId(id: number): Promise<Consumidor> {
    const response: AxiosResponse<Consumidor> = await axios.get(
      `${CONSUMIDORES_ENDPOINT}/${id}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  /**
   * Criar novo Consumidor
   * POST /logvert/consumidores
   * Envia apenas: nome, cpf_cnpj, email, celular, endereco
   * @param payload - Dados do novo consumidor
   */
  async criar(payload: ConsumidorCreatePayload): Promise<Consumidor> {
    const response: AxiosResponse<Consumidor> = await axios.post(
      CONSUMIDORES_ENDPOINT,
      payload,
      { headers: getHeaders() }
    );
    return response.data;
  },

  /**
   * Atualizar Consumidor existente
   * PUT /logvert/consumidores/{id}
   * Envia: nome, cpf_cnpj, email, celular, telefone
   * ⚠️ Atenção: O PUT NÃO recebe 'endereco', conforme a regra do back-end.
   * @param id - ID do consumidor
   * @param payload - Dados atualizados
   */
  async atualizar(id: number, payload: ConsumidorUpdatePayload): Promise<Consumidor> {
    const response: AxiosResponse<Consumidor> = await axios.put(
      `${CONSUMIDORES_ENDPOINT}/${id}`,
      payload,
      { headers: getHeaders() }
    );
    return response.data;
  },

  /**
   * Desativar Consumidores em Lote
   * PATCH /logvert/consumidores
   * Envia um array de IDs no body: [1, 2, 3]
   * Espera resposta 204 (No Content) em caso de sucesso.
   * @param ids - Array de IDs para desativar
   */
  async desativarEmLote(ids: number[]): Promise<void> {
    await axios.patch(
      CONSUMIDORES_ENDPOINT,
      ids,
      { headers: getHeaders() }
    );
  },

  /**
   * Deletar Consumidor Permanentemente
   * DELETE /logvert/consumidores/{id}
   * Espera resposta 204 (No Content) em caso de sucesso.
   * @param id - ID do consumidor a excluir
   */
  async deletar(id: number): Promise<void> {
    await axios.delete(
      `${CONSUMIDORES_ENDPOINT}/${id}`,
      { headers: getHeaders() }
    );
  },

};

export default consumidorService;
