// API hataları: durum kodu ve kod taşıyan hata sınıfı; henüz bağlanmamış uç noktalar için notConnected().
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// API seçilmiş ama bu konu henüz bağlanmamışsa çağrılır.
export function notConnected(): never {
  throw new ApiError(501, 'Bu konu henüz API\'ye bağlanmadı', 'NOT_CONNECTED');
}
