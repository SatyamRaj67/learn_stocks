import { prisma } from '@/lib/prisma';
import { faker } from '@faker-js/faker';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionStatus, TransactionType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Control variables
const NUMBER_OF_USERS = 50;
const NUMBER_OF_STOCKS = 100;
const TRANSACTIONS_PER_USER = 20;
const DAYS_OF_HISTORY = 30;
const PRICE_POINTS_PER_DAY = 24; 

// Helper function to convert number to Decimal
function toDecimal(num: number): Decimal {
  return new Decimal(num.toFixed(2));
}

async function main() {
  console.log('Starting seeding...');
  
  // Clear existing data
  await prisma.$transaction([
    prisma.watchlistItem.deleteMany(),
    prisma.watchlist.deleteMany(),
    prisma.priceHistory.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.position.deleteMany(),
    prisma.portfolio.deleteMany(),
    prisma.stock.deleteMany(),
    prisma.twoFactorConfirmation.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  
  console.log('Database cleared. Creating users...');
  
  // Create users
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create an admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      image: faker.image.avatar(),
      emailVerified: new Date(),
      balance: toDecimal(50000),
      isTwoFactorEnabled: false,
      portfolio: {
        create: {}
      },
      watchlist: {
        create: {}
      }
    },
  });
  users.push(admin);
  
  // Create regular users
  for (let i = 0; i < NUMBER_OF_USERS - 1; i++) {
    const balance = faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 });
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: hashedPassword,
        role: UserRole.USER,
        image: faker.image.avatar(),
        emailVerified: faker.date.past(),
        balance: toDecimal(balance),
        isTwoFactorEnabled: faker.datatype.boolean(0.2),
        portfolio: {
          create: {}
        },
        watchlist: {
          create: {}
        }
      },
    });
    users.push(user);
  }
  
  console.log(`Created ${users.length} users. Creating stocks...`);
  
  // Create stocks
  const stocks = [];
  const sectors = [
    'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary', 
    'Communication Services', 'Industrials', 'Consumer Staples', 
    'Energy', 'Utilities', 'Real Estate', 'Materials'
  ];
  
  // Make some fake companies with realistic names
  const companyNames = [];
  for (let i = 0; i < NUMBER_OF_STOCKS; i++) {
    const name = faker.company.name();
    const suffix = faker.helpers.arrayElement(['Inc', 'Corp', 'Ltd', 'Group', 'Holdings', 'Technologies', 'Pharmaceuticals', 'Energy']);
    companyNames.push(`${name} ${suffix}`);
  }
  
  // Create stock symbols
  const createSymbol = (name: string) => {
    // Extract the first letters of each word
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 4).toUpperCase();
    }
    
    // Try to create a symbol from the first letters
    let symbol = '';
    for (const word of words) {
      if (word.length > 0 && !/^(Inc|Corp|Ltd|Group|Holdings|Technologies|Pharmaceuticals|Energy)$/.test(word)) {
        symbol += word[0];
      }
    }
    
    // If symbol is too short, add some consonants from the first word
    if (symbol.length < 3) {
      const consonants = words[0].match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
      symbol += consonants.slice(0, 3 - symbol.length).join('');
    }
    
    return symbol.toUpperCase().substring(0, 5);
  };
  
  // Ensure unique symbols
  const usedSymbols = new Set();
  
  for (let i = 0; i < NUMBER_OF_STOCKS; i++) {
    const name = companyNames[i];
    let symbol = createSymbol(name);
    
    // Make sure symbol is unique
    while (usedSymbols.has(symbol)) {
      symbol = symbol + faker.number.int({ min: 1, max: 9 });
    }
    usedSymbols.add(symbol);
    
    const currentPrice = faker.number.float({ min: 5, max: 1000, fractionDigits: 2 });
    const openPriceMultiplier = 1 + faker.number.float({ min: -0.05, max: 0.05, fractionDigits: 4 });
    const openPrice = currentPrice * openPriceMultiplier;
    const highPrice = Math.max(currentPrice, openPrice) * (1 + faker.number.float({ min: 0, max: 0.05, fractionDigits: 4 }));
    const lowPrice = Math.min(currentPrice, openPrice) * (1 - faker.number.float({ min: 0, max: 0.05, fractionDigits: 4 }));
    const previousClose = currentPrice * (1 + faker.number.float({ min: -0.05, max: 0.05, fractionDigits: 4 }));
    const volume = faker.number.int({ min: 1000, max: 10000000 });
    
    // Calculate market cap
    const marketCapMultiplier = faker.number.int({ min: 1000000, max: 10000000000 });
    const marketCap = currentPrice * marketCapMultiplier;
    
    const priceCap = faker.datatype.boolean(0.2) ? currentPrice * 1.5 : null;
    const volatility = faker.number.float({ min: 0.005, max: 0.08, fractionDigits: 4 });
    const jumpProbability = faker.number.float({ min: 0.001, max: 0.05, fractionDigits: 4 });
    const maxJumpMultiplier = faker.number.float({ min: 1.05, max: 1.30, fractionDigits: 4 });
    
    const stock = await prisma.stock.create({
      data: {
        symbol,
        name,
        description: faker.lorem.paragraph(),
        logoUrl: faker.image.urlLoremFlickr({ category: 'business' }),
        sector: faker.helpers.arrayElement(sectors),
        currentPrice: toDecimal(currentPrice),
        openPrice: toDecimal(openPrice),
        highPrice: toDecimal(highPrice),
        lowPrice: toDecimal(lowPrice),
        previousClose: toDecimal(previousClose),
        volume,
        marketCap: toDecimal(marketCap),
        isActive: true,
        isFrozen: faker.datatype.boolean(0.05),
        priceChangeDisabled: faker.datatype.boolean(0.05),
        priceCap: priceCap ? toDecimal(priceCap) : null,
        volatility: toDecimal(volatility),
        jumpProbability: toDecimal(jumpProbability),
        maxJumpMultiplier: toDecimal(maxJumpMultiplier),
        createdById: faker.helpers.arrayElement(users).id,
      }
    });
    
    stocks.push(stock);
  }
  
  console.log(`Created ${stocks.length} stocks. Creating price history...`);
  
  // Create price history
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - DAYS_OF_HISTORY);
  
  for (const stock of stocks) {
    let currentPrice = parseFloat(stock.currentPrice.toString());
    const priceHistoryBatch = [];
    
    // Generate price points for each day
    for (let day = 0; day < DAYS_OF_HISTORY; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + day);
      
      // Generate price points throughout the day
      for (let hour = 0; hour < PRICE_POINTS_PER_DAY; hour++) {
        const timestamp = new Date(date);
        timestamp.setHours(9 + Math.floor(hour * (8 / PRICE_POINTS_PER_DAY)));
        timestamp.setMinutes((hour * (8 / PRICE_POINTS_PER_DAY) % 1) * 60);
        
        // Determine if a price jump occurs
        const isJump = Math.random() < parseFloat(stock.jumpProbability.toString());
        let jumpPercentage = null;
        
        if (isJump) {
          // Calculate jump direction (up or down) and magnitude
          const jumpDirection = Math.random() < 0.6 ? 1 : -1; // 60% chance of positive jump
          const jumpMultiplier = 1 + (jumpDirection * Math.random() * (parseFloat(stock.maxJumpMultiplier.toString()) - 1));
          currentPrice = currentPrice * jumpMultiplier;
          jumpPercentage = (jumpMultiplier - 1) * 100 * jumpDirection;
        } else {
          // Normal price movement based on volatility
          const movement = 1 + (Math.random() * 2 - 1) * parseFloat(stock.volatility.toString());
          currentPrice = currentPrice * movement;
        }
        
        // Ensure price doesn't go below 0.01
        currentPrice = Math.max(0.01, currentPrice);
        
        // Apply price cap if it exists
        if (stock.priceCap && currentPrice > parseFloat(stock.priceCap.toString())) {
          currentPrice = parseFloat(stock.priceCap.toString());
        }
        
        priceHistoryBatch.push({
          stockId: stock.id,
          price: toDecimal(currentPrice),
          volume: faker.number.int({ min: 1000, max: 1000000 }),
          timestamp,
          wasJump: isJump,
          jumpPercentage: isJump ? toDecimal(jumpPercentage as number) : null
        });
      }
    }
    
    // Update current stock price to the latest price
    await prisma.stock.update({
      where: { id: stock.id },
      data: { currentPrice: priceHistoryBatch[priceHistoryBatch.length - 1].price }
    });
    
    // Insert price history in batches
    await prisma.priceHistory.createMany({
      data: priceHistoryBatch
    });
  }
  
  console.log(`Created price history. Creating watchlists...`);
  
  // Add stocks to watchlists
  for (const user of users) {
    const watchlist = await prisma.watchlist.findUnique({
      where: { userId: user.id }
    });
    
    if (watchlist) {
      // Add 5-15 random stocks to each watchlist
      const numWatchlistItems = faker.number.int({ min: 5, max: 15 });
      const watchlistStocks = faker.helpers.arrayElements(stocks, numWatchlistItems);
      
      for (const stock of watchlistStocks) {
        await prisma.watchlistItem.create({
          data: {
            watchlistId: watchlist.id,
            stockId: stock.id,
            addedAt: faker.date.recent({ days: 30 })
          }
        });
      }
    }
  }
  
  console.log(`Created watchlists. Creating transactions and positions...`);
  
  // Create transactions and positions
  for (const user of users) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id }
    });
    
    if (!portfolio) {
      console.log(`No portfolio found for user ${user.id}, skipping transactions`);
      continue;
    }
    
    // Track positions for this user
    const userPositions = new Map();
    
    // Create random transactions
    for (let i = 0; i < TRANSACTIONS_PER_USER; i++) {
      const stock = faker.helpers.arrayElement(stocks);
      const type = faker.helpers.arrayElement([TransactionType.BUY, TransactionType.SELL]);
      const quantity = faker.number.int({ min: 1, max: 100 });
      
      // Get a random price from this stock's history
      const pricePoint = await prisma.priceHistory.findFirst({
        where: { stockId: stock.id },
        orderBy: { timestamp: 'desc' },
        skip: faker.number.int({ min: 0, max: 10 }),
        take: 1
      });
      
      const price = pricePoint ? parseFloat(pricePoint.price.toString()) : parseFloat(stock.currentPrice.toString());
      const totalAmount = price * quantity;
      
      // For SELL transactions, make sure user has enough shares
      if (type === TransactionType.SELL) {
        const currentPosition = userPositions.get(stock.id) || 0;
        if (currentPosition < quantity) {
          continue; // Skip this transaction if not enough shares
        }
      }
      

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          stockId: stock.id,
          type,
          status: TransactionStatus.COMPLETED,
          quantity,
          price: toDecimal(price),
          totalAmount: toDecimal(totalAmount),
          timestamp: faker.date.recent({ days: 30 }),
        }
      });
      
      // Update the user's position
      const currentPosition = userPositions.get(stock.id) || 0;
      const newQuantity = type === TransactionType.BUY 
        ? currentPosition + quantity 
        : currentPosition - quantity;
      
      userPositions.set(stock.id, newQuantity);
    }
    
    // Create positions based on transactions
    for (const [stockId, quantity] of userPositions.entries()) {
      if (quantity > 0) {
        const stock = stocks.find(s => s.id === stockId);
        if (!stock) {
          console.log(`Stock with ID ${stockId} not found, skipping position`);
          continue;
        }
        const stockPrice = parseFloat(stock.currentPrice.toString());
        const minPrice = stockPrice * 0.7;
        const maxPrice = stockPrice * 1.3;
        
        const averageBuyPrice = faker.number.float({ 
          min: minPrice, 
          max: maxPrice,
          fractionDigits: 2
        });
        
        const currentValue = stockPrice * quantity;
        const profitLoss = (stockPrice - averageBuyPrice) * quantity;
        
        await prisma.position.create({
          data: {
            portfolioId: portfolio.id,
            stockId,
            quantity,
            averageBuyPrice: toDecimal(averageBuyPrice),
            currentValue: toDecimal(currentValue),
            profitLoss: toDecimal(profitLoss),
          }
        });
      }
    }
    
    // Update user's portfolio value and total profit
    const positions = await prisma.position.findMany({
      where: { portfolioId: portfolio.id }
    });
    
    const portfolioValue = positions.reduce(
      (total, pos) => total + parseFloat(pos.currentValue.toString()), 
      0
    );
    
    const totalProfit = positions.reduce(
      (total, pos) => total + parseFloat(pos.profitLoss.toString()), 
      0
    );
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioValue: toDecimal(portfolioValue),
        totalProfit: toDecimal(totalProfit)
      }
    });
  }
  
  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });