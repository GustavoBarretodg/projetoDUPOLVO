// Taxa de servico cobrada de quem nao e assinante premium.
// Ninguem fica premium sozinho (evita burlar a taxa): o campo `premium`
// so muda por acao de admin, no backend.
export const SERVICE_FEE_RATE = 0.2;

export interface OrderTotals {
  subtotal: number;
  fee: number;
  total: number;
  isPremium: boolean;
}

export function isPremiumUser(user: any): boolean {
  return !!(user && user.id && user.premium);
}

export function calculateOrder(subtotal: number, user: any): OrderTotals {
  const premium = isPremiumUser(user);
  const fee = premium ? 0 : subtotal * SERVICE_FEE_RATE;
  return {
    subtotal,
    fee,
    total: subtotal + fee,
    isPremium: premium,
  };
}
