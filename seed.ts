import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configuration
const DAYS_OF_HISTORY = 45;
const ADMIN_USER_ID = "cm92xb1nf0000vbhg5wioljuw"; // Your admin user ID

/**
 * Simulate price change based on volatility with possible jumps
 */
function simulatePriceChange(
  currentPrice: number,
  volatility: number,
  jumpProbability: number,
  maxJumpMultiplier: number
): { newPrice: number; isJump: boolean; jumpPercentage: number | null } {
  // Check for a price jump
  const randomValue = Math.random();
  const isJump = randomValue < jumpProbability;

  let newPrice: number;
  let jumpPercentage: number | null = null;

  if (isJump) {
    // Generate a jump direction (up or down)
    const jumpDirection = Math.random() > 0.5 ? 1 : -1;
    // Calculate jump multiplier between 1 and maxJumpMultiplier
    const jumpMultiplier = 1 + Math.random() * (maxJumpMultiplier - 1);
    // Apply jump
    newPrice = currentPrice * (1 + jumpDirection * (jumpMultiplier - 1));
    jumpPercentage = jumpDirection * (jumpMultiplier - 1) * 100;
  } else {
    // Regular price movement based on volatility
    const percentChange = (Math.random() * 2 - 1) * volatility;
    newPrice = currentPrice * (1 + percentChange);
  }

  // Ensure price doesn't go below 0.01
  newPrice = Math.max(newPrice, 0.01);
  return { newPrice, isJump, jumpPercentage };
}

/**
 * Generate price history for AAPL
 */
async function generatePriceHistory(
  stockId: string,
  initialPrice: number,
  volatility: number,
  jumpProbability: number,
  maxJumpMultiplier: number,
  days: number
) {
  let currentPrice = initialPrice;
  const priceHistory = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate price change
    const { newPrice, isJump, jumpPercentage } = simulatePriceChange(
      currentPrice,
      volatility,
      jumpProbability,
      maxJumpMultiplier
    );

    currentPrice = newPrice;

    // Generate a random volume between 100,000 and 30,000,000 (more realistic for Apple)
    const volume = faker.number.int({ min: 100000, max: 30000000 });

    priceHistory.push({
      stockId,
      price: currentPrice,
      volume,
      timestamp: date,
      wasJump: isJump,
      jumpPercentage: isJump ? jumpPercentage : null,
    });
  }

  // Update the stock's current price to match the most recent price
  await prisma.stock.update({
    where: { id: stockId },
    data: {
      currentPrice: currentPrice,
      previousClose:
        priceHistory[priceHistory.length - 2]?.price || currentPrice,
    },
  });

  // Create price history entries
  await prisma.priceHistory.createMany({
    data: priceHistory,
  });
}

/**
 * Create AAPL stock with price history
 */
async function createAppleStock() {
  console.log("Starting AAPL stock creation...");

  // Check if admin user exists
  const adminUser = await prisma.user.findUnique({
    where: { id: ADMIN_USER_ID },
  });

  if (!adminUser) {
    console.error(`Admin user with ID ${ADMIN_USER_ID} not found`);
    return;
  }

  // Check if AAPL already exists
  const existingApple = await prisma.stock.findUnique({
    where: { symbol: "AAPL" },
  });

  if (existingApple) {
    console.log("AAPL stock already exists. Adding new price history...");

    // Delete existing price history
    await prisma.priceHistory.deleteMany({
      where: { stockId: existingApple.id },
    });

    // Set realistic Apple parameters
    const volatility = 0.015; // Apple is less volatile than average
    const jumpProbability = 0.02;
    const maxJumpMultiplier = 1.08;

    // Generate new price history using the existing stock price
    await generatePriceHistory(
      existingApple.id,
      existingApple.currentPrice.toNumber(),
      volatility,
      jumpProbability,
      maxJumpMultiplier,
      DAYS_OF_HISTORY
    );

    console.log("Updated AAPL price history successfully!");
    return;
  }

  // Create Apple stock with realistic parameters
  const initialPrice = 175.25; // Realistic starting price
  const volatility = 0.015; // Apple is less volatile than average
  const jumpProbability = 0.02;
  const maxJumpMultiplier = 1.08;
  const marketCap = 2800000000000; // ~$2.8T market cap

  // Create the Apple stock
  const appleStock = await prisma.stock.create({
    data: {
      symbol: "AAPL",
      name: "Apple Inc.",
      description:
        "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
      sector: "Technology",
      currentPrice: initialPrice,
      openPrice: initialPrice,
      highPrice: initialPrice,
      lowPrice: initialPrice,
      previousClose: initialPrice,
      volume: faker.number.int({ min: 10000000, max: 80000000 }),
      marketCap,
      volatility,
      jumpProbability,
      maxJumpMultiplier,
      createdById: ADMIN_USER_ID,
      logoUrl: "https://logo.clearbit.com/apple.com",
    },
  });

  console.log(`Created AAPL stock. Generating price history...`);

  // Generate price history for Apple
  await generatePriceHistory(
    appleStock.id,
    initialPrice,
    volatility,
    jumpProbability,
    maxJumpMultiplier,
    DAYS_OF_HISTORY
  );

  console.log("AAPL stock created successfully with price history!");
}

createAppleStock()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
