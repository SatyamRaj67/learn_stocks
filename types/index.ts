type Stock = {
  id: string;
  symbol: string;
  name: string;
  sector?: string | null;
  currentPrice: number;
  previousClose?: number | null;
  volume: number;
  marketCap?: number | null;
  isActive: boolean;
  isFrozen: boolean;
};

type Position = {
  id: string;
  quantity: number;
  averageBuyPrice: number;
  currentValue: number;
  profitLoss: number;
  stock: {
    symbol: string;
    name: string;
    sector: string | null;
    currentPrice: number;
  };
};

type Transaction = {
  id: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  stock: {
    symbol: string;
    name: string;
  };
};

interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  emailVerified: Date | null;
  balance: string;
  totalProfit: string;
  portfolioValue: string;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
}
