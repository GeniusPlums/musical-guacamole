import type {
  AIInsight,
  Alert,
  AppData,
  AuditReport,
  Employee,
  EventType,
  InventoryCategory,
  InventoryItem,
  KitchenWastageItem,
  Outlet,
  ShiftName,
  StockEvent,
} from "../types";

// Seeded PRNG for reproducible demo data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const OUTLETS: Outlet[] = [
  { id: "outlet-a", name: "The Copper Tap", location: "Bandra West, Mumbai" },
  { id: "outlet-b", name: "Skyline Lounge", location: "Koramangala, Bangalore" },
];

const EMPLOYEE_NAMES = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
  "Ananya Iyer", "Rohit Mehta", "Kavita Nair", "Arjun Desai", "Meera Joshi",
  "Suresh Pillai", "Divya Rao", "Karan Malhotra", "Neha Gupta", "Sanjay Verma",
  "Pooja Kulkarni", "Rahul Chatterjee", "Ishita Banerjee", "Deepak Yadav", "Lakshmi Menon",
];

const ROLES = ["Bartender", "Bar Manager", "Steward", "Kitchen Staff", "Store Keeper", "Floor Manager"];

const LIQUOR_PRODUCTS: Record<Exclude<InventoryCategory, "Kitchen Ingredients">, string[]> = {
  Beer: [
    "Kingfisher Premium", "Bira White", "Corona Extra", "Heineken", "Budweiser",
    "Tuborg Strong", "Carlsberg", "Hoegaarden", "Simba Stout", "Budweiser Magnum",
    "Foster's Lager", "Miller Lite", "Bira Gold", "Kingfisher Ultra", "Bud Light",
    "Asahi Super Dry", "Guinness", "Breezer Mango", "Breezer Cranberry", "Breezer Peach",
    "Strongbow Apple", "Kati Patang", "White Owl", "Godfather Strong", "Knock Out",
    "Haywards 5000", "Royal Challenge", "Bro Code", "Budweiser 0.0", "Bira Boom",
    "Peroni Nastro", "Stella Artois", "Beck's", "Tiger Beer", "Sapporo",
  ],
  Whiskey: [
    "Black Dog", "Johnnie Walker Red", "Johnnie Walker Black", "Chivas Regal 12",
    "Jameson", "Ballantine's", "Teachers Highland Cream", "Royal Stag", "Blenders Pride",
    "McDowell's No.1", "Antiquity Blue", "100 Pipers", "Glenfiddich 12", "Glenlivet 12",
    "Jack Daniel's", "Jim Beam", "Maker's Mark", "Monkey Shoulder", "Amrut Fusion",
    "Paul John Brilliance", "Rampur Single Malt", "Indri Trini", "Signature", "Officer's Choice",
    "Imperial Blue", "Rockford Reserve", "VAT 69", "Dewar's White Label", "Grant's",
    "Old Parr", "Black & White", "Seagram's 100 Pipers", "William Lawson's", "J&B Rare",
  ],
  Vodka: [
    "Absolut", "Smirnoff", "Grey Goose", "Belvedere", "Ketel One",
    "Magic Moments", "White Mischief", "Romanov", "Eristoff", "Flirt",
    "Ciroc", "Tito's", "Finlandia", "Stolichnaya", "Svedka",
    "Haku", "Ketel One Citroen", "Absolut Citron", "Smirnoff Green Apple", "Beluga",
    "Three Olives", "UV Blue", "Skyy", "Pinnacle", "Russian Standard",
  ],
  Rum: [
    "Old Monk", "Bacardi White", "Bacardi Gold", "Captain Morgan", "Havana Club",
    "Malibu", "McDowell's Rum", "Contessa", "Appleton Estate", "Mount Gay",
    "Diplomatico", "Zacapa 23", "Kraken Black Spiced", "Sailor Jerry", "Myers's Dark",
    "Bumbu", "Plantation Original", "El Dorado 12", "Ron Zacapa", "Pusser's",
    "Lamb's Navy", "Hercules", "Mansion House", "Contessa XXX", "Old Monk Supreme",
  ],
  Gin: [
    "Bombay Sapphire", "Tanqueray", "Hendrick's", "Beefeater", "Gordon's",
    "Roku", "Monkey 47", "The Botanist", "Sipsmith", "Plymouth",
    "Greater Than", "Hapusa", "Stranger & Sons", "Jaisalmer", "Terai",
    "Ramsay", "D'Argent", "Opihr", "Bulldog Gin", "Citadelle",
    "Nordés", "Malfy", "Fords", "Aviation", "Nolet's Silver",
  ],
};

const KITCHEN_ITEMS = [
  "Tomatoes", "Onions", "Potatoes", "Chicken Breast", "Paneer",
  "Bell Peppers", "Garlic", "Ginger", "Cream", "Butter",
  "Cheese Mozzarella", "Lettuce", "Mushrooms", "Prawns", "Fish Fillet",
  "Lamb Mince", "Basil", "Olive Oil", "Pasta Penne", "Rice Basmati",
  "Flour", "Eggs", "Bread Buns", "French Fries", "Bacon",
  "Avocado", "Lime", "Mint", "Coriander", "Spinach",
  "Carrots", "Cucumber", "Jalapeños", "Sour Cream", "Mayonnaise",
  "Ketchup", "Mustard", "Soy Sauce", "Worcestershire", "Tabasco",
];

function generateEmployees(): Employee[] {
  const employees: Employee[] = [];
  let idx = 0;
  for (const outlet of OUTLETS) {
    for (let i = 0; i < 10; i++) {
      employees.push({
        id: `emp-${idx + 1}`,
        name: EMPLOYEE_NAMES[idx],
        role: i === 0 ? "Bar Manager" : i === 1 ? "Store Keeper" : pick(ROLES),
        outletId: outlet.id,
        employeeCode: `EMP-${String(400 + idx + 1)}`,
      });
      idx++;
    }
  }
  return employees;
}

function generateInventory(employees: Employee[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  let skuCounter = 1000;

  for (const outlet of OUTLETS) {
    for (const [category, products] of Object.entries(LIQUOR_PRODUCTS) as [Exclude<InventoryCategory, "Kitchen Ingredients">, string[]][]) {
      for (const name of products) {
        const isBeer = category === "Beer";
        const costPrice = isBeer ? randInt(80, 250) : randInt(800, 4500);
        const sellingPrice = Math.round(costPrice * (isBeer ? 3.5 : 4.2));
        const currentStock = randInt(20, 200);
        items.push({
          id: `inv-${outlet.id}-${skuCounter}`,
          outletId: outlet.id,
          name,
          category,
          sku: `SKU-${skuCounter}`,
          costPrice,
          sellingPrice,
          currentStock,
          reorderThreshold: Math.max(10, Math.floor(currentStock * 0.15)),
          unit: "bottles",
        });
        skuCounter++;
      }
    }

    for (const name of KITCHEN_ITEMS) {
      const costPrice = randInt(40, 350);
      const currentStock = randInt(5, 150);
      items.push({
        id: `inv-${outlet.id}-${skuCounter}`,
        outletId: outlet.id,
        name,
        category: "Kitchen Ingredients",
        sku: `SKU-${skuCounter}`,
        costPrice,
        sellingPrice: Math.round(costPrice * 2.5),
        currentStock,
        reorderThreshold: Math.max(5, Math.floor(currentStock * 0.2)),
        unit: pick(["kg", "kg", "kg", "litres", "units"]),
      });
      skuCounter++;
    }
  }

  // Demo narrative: Black Dog discrepancy at Outlet A
  const blackDog = items.find(
    (i) => i.outletId === "outlet-a" && i.name === "Black Dog"
  );
  if (blackDog) {
    blackDog.currentStock = 23;
    blackDog.reorderThreshold = 30;
  }

  void employees;
  return items;
}

function generateEvents(
  inventory: InventoryItem[],
  employees: Employee[]
): StockEvent[] {
  const events: StockEvent[] = [];
  let eventId = 1;
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const outletEmployees = (outletId: string) =>
    employees.filter((e) => e.outletId === outletId);

  // Generate ~5000 events across 6 months
  for (let day = 0; day < 180; day++) {
    const date = new Date(sixMonthsAgo);
    date.setDate(date.getDate() + day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isSaturday = date.getDay() === 6;
    const eventsPerDay = isWeekend ? randInt(35, 55) : randInt(20, 35);

    for (let e = 0; e < eventsPerDay; e++) {
      const item = pick(inventory);
      const emps = outletEmployees(item.outletId);
      const employee = pick(emps);
      const hour = randInt(10, 23);
      const minute = randInt(0, 59);
      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, 0, 0);

      const shift: ShiftName = isSaturday && hour >= 18
        ? "Saturday Night Shift"
        : hour < 12
          ? "Morning Shift"
          : hour < 17
            ? "Afternoon Shift"
            : "Evening Shift";

      const roll = rand();
      let type: EventType;
      let quantity: number;
      let reference: string | undefined;
      let notes: string | undefined;

      if (roll < 0.08) {
        type = "STOCK_RECEIVED";
        quantity = randInt(6, 48);
        reference = `PO-${randInt(1000, 9999)}`;
      } else if (roll < 0.75) {
        type = "SALE";
        quantity = -randInt(1, 4);
        reference = `Sale #${randInt(100, 9999)}`;
      } else if (roll < 0.85) {
        type = "WASTAGE";
        quantity = -randInt(1, 3);
        notes = pick(["Broken bottle", "Expired", "Spillage", "Quality reject"]);
      } else if (roll < 0.92) {
        type = "MANUAL_ADJUSTMENT";
        quantity = randInt(-5, 5);
        notes = "Inventory reconciliation";
      } else if (roll < 0.96) {
        type = "TRANSFER";
        quantity = randInt(-10, 10);
        reference = `TRF-${randInt(100, 999)}`;
      } else {
        type = "CLOSING_COUNT";
        quantity = 0;
        notes = "End of shift count";
      }

      events.push({
        id: `evt-${eventId++}`,
        outletId: item.outletId,
        inventoryItemId: item.id,
        type,
        quantity,
        unit: item.unit,
        reference,
        employeeId: employee.id,
        shift,
        timestamp,
        notes,
      });
    }
  }

  // Inject Black Dog leakage narrative at Outlet A
  const blackDog = inventory.find(
    (i) => i.outletId === "outlet-a" && i.name === "Black Dog"
  );
  if (blackDog) {
    const outletEmps = outletEmployees("outlet-a");
    const suspectEmp = outletEmps.find((e) => e.employeeCode === "EMP-442") ??
      outletEmps[3];
    suspectEmp.employeeCode = "EMP-442";

    // Large receive 3 weeks ago
    const receiveDate = new Date(now);
    receiveDate.setDate(receiveDate.getDate() - 21);
    receiveDate.setHours(10, 15, 0, 0);
    events.push({
      id: `evt-${eventId++}`,
      outletId: "outlet-a",
      inventoryItemId: blackDog.id,
      type: "STOCK_RECEIVED",
      quantity: 48,
      unit: "bottles",
      reference: "PO-8847",
      employeeId: outletEmps[1].id,
      shift: "Morning Shift",
      timestamp: receiveDate,
      notes: "+12 Cases received",
    });

    // Sales that don't account for missing stock
    for (let i = 0; i < 15; i++) {
      const saleDate = new Date(now);
      saleDate.setDate(saleDate.getDate() - randInt(1, 20));
      saleDate.setHours(randInt(18, 23), randInt(0, 59), 0, 0);
      events.push({
        id: `evt-${eventId++}`,
        outletId: "outlet-a",
        inventoryItemId: blackDog.id,
        type: "SALE",
        quantity: -randInt(1, 3),
        unit: "bottles",
        reference: `Sale #${440 + i}`,
        employeeId: suspectEmp.id,
        shift: saleDate.getDay() === 6 ? "Saturday Night Shift" : "Evening Shift",
        timestamp: saleDate,
      });
    }

    // Wastage event
    const wastageDate = new Date(now);
    wastageDate.setDate(wastageDate.getDate() - 5);
    wastageDate.setHours(20, 30, 0, 0);
    events.push({
      id: `evt-${eventId++}`,
      outletId: "outlet-a",
      inventoryItemId: blackDog.id,
      type: "WASTAGE",
      quantity: -1,
      unit: "bottles",
      employeeId: suspectEmp.id,
      shift: "Saturday Night Shift",
      timestamp: wastageDate,
      notes: "Broken bottle during rush hour",
    });

    // Closing count revealing discrepancy
    const countDate = new Date(now);
    countDate.setDate(countDate.getDate() - 1);
    countDate.setHours(23, 0, 0, 0);
    events.push({
      id: `evt-${eventId++}`,
      outletId: "outlet-a",
      inventoryItemId: blackDog.id,
      type: "CLOSING_COUNT",
      quantity: 0,
      unit: "bottles",
      employeeId: outletEmps[0].id,
      shift: "Evening Shift",
      timestamp: countDate,
      notes: "15 bottles unaccounted for",
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function generateAlerts(inventory: InventoryItem[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  const blackDog = inventory.find(
    (i) => i.outletId === "outlet-a" && i.name === "Black Dog"
  );
  if (blackDog) {
    alerts.push({
      id: "alert-1",
      outletId: "outlet-a",
      severity: "critical",
      message: "15 bottles of Black Dog unaccounted for",
      timestamp: new Date(now.getTime() - 3600000),
      inventoryItemId: blackDog.id,
    });
  }

  const lowBeer = inventory.filter(
    (i) => i.category === "Beer" && i.currentStock < i.reorderThreshold
  );
  if (lowBeer.length > 0) {
    alerts.push({
      id: "alert-2",
      outletId: lowBeer[0].outletId,
      severity: "warning",
      message: "Beer stock below threshold across multiple SKUs",
      timestamp: new Date(now.getTime() - 7200000),
    });
  }

  alerts.push({
    id: "alert-3",
    outletId: "outlet-a",
    severity: "critical",
    message: "Unusual variance detected on Saturday Night Shift",
    timestamp: new Date(now.getTime() - 86400000),
  });

  alerts.push({
    id: "alert-4",
    outletId: "outlet-b",
    severity: "info",
    message: "Weekly audit report ready for review",
    timestamp: new Date(now.getTime() - 172800000),
  });

  alerts.push({
    id: "alert-5",
    outletId: "outlet-a",
    severity: "warning",
    message: "Johnnie Walker Black variance exceeds 8% threshold",
    timestamp: new Date(now.getTime() - 259200000),
    inventoryItemId: inventory.find((i) => i.name === "Johnnie Walker Black")?.id,
  });

  return alerts;
}

function generateKitchenWastage(): KitchenWastageItem[] {
  const items: KitchenWastageItem[] = [];
  let id = 1;

  for (const outlet of OUTLETS) {
    for (const name of KITCHEN_ITEMS.slice(0, 15)) {
      const purchased = randInt(80, 200);
      const spoiled = randInt(5, 30);
      const used = randInt(60, purchased - spoiled - 5);
      const unaccounted = purchased - used - spoiled;
      const costPerUnit = randInt(40, 120);
      const lossValue = (spoiled + unaccounted) * costPerUnit;
      const wastagePercent = ((spoiled + unaccounted) / purchased) * 100;

      items.push({
        id: `kitchen-${id++}`,
        outletId: outlet.id,
        name,
        purchased,
        used,
        spoiled,
        unaccounted: Math.max(0, unaccounted),
        unit: "kg",
        costPerUnit,
        lossValue,
        wastagePercent,
      });
    }

    // Demo: Tomatoes with specific numbers
    const tomatoes = items.find(
      (i) => i.outletId === outlet.id && i.name === "Tomatoes"
    );
    if (tomatoes) {
      tomatoes.purchased = 120;
      tomatoes.used = 90;
      tomatoes.spoiled = 20;
      tomatoes.unaccounted = 10;
      tomatoes.costPerUnit = 45;
      tomatoes.lossValue = (20 + 10) * 45;
      tomatoes.wastagePercent = 25;
    }
  }

  return items;
}

function generateAuditReports(employees: Employee[]): AuditReport[] {
  const reports: AuditReport[] = [];
  const now = new Date();

  for (let w = 0; w < 8; w++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);

    for (const outlet of OUTLETS) {
      const emps = employees.filter((e) => e.outletId === outlet.id);
      reports.push({
        id: `audit-${outlet.id}-w${w}`,
        weekStart,
        weekEnd,
        outletId: outlet.id,
        inventoryLoss: randInt(15000, 85000),
        topMissingProducts: [
          { name: "Black Dog", variance: -15, lossValue: 67500 },
          { name: "Johnnie Walker Black", variance: -8, lossValue: 48000 },
          { name: "Kingfisher Premium", variance: -24, lossValue: 4800 },
          { name: "Old Monk", variance: -6, lossValue: 3600 },
          { name: "Absolut", variance: -4, lossValue: 3200 },
        ],
        highestVarianceShift: w % 2 === 0 ? "Saturday Night Shift" : "Evening Shift",
        highestVarianceEmployee: {
          id: emps[3]?.id ?? "emp-4",
          name: emps[3]?.name ?? "Vikram Singh",
          employeeCode: "EMP-442",
        },
        outletComparison: {
          outletA: { name: OUTLETS[0].name, lossPercent: 2.8 + w * 0.1 },
          outletB: { name: OUTLETS[1].name, lossPercent: 0.9 + w * 0.05 },
        },
      });
    }
  }

  return reports;
}

function generateAIInsights(inventory: InventoryItem[]): AIInsight[] {
  const blackDog = inventory.find((i) => i.name === "Black Dog");
  return [
    {
      id: "ai-1",
      inventoryItemId: blackDog?.id,
      outletId: "outlet-a",
      insight: "80% of discrepancies occurred during weekend evening shifts.",
      confidence: 87,
      type: "pattern",
    },
    {
      id: "ai-2",
      inventoryItemId: blackDog?.id,
      outletId: "outlet-a",
      insight: "Variance for Black Dog increased 230% over the last month.",
      confidence: 92,
      type: "trend",
    },
    {
      id: "ai-3",
      outletId: "outlet-a",
      insight: "This outlet shows 3x higher wastage than the company average.",
      confidence: 78,
      type: "comparison",
    },
    {
      id: "ai-4",
      outletId: "outlet-b",
      insight: "Kitchen spoilage peaks on Mondays — likely over-ordering on weekends.",
      confidence: 71,
      type: "anomaly",
    },
    {
      id: "ai-5",
      insight: "Transfer events between outlets correlate with 12% higher variance within 48 hours.",
      confidence: 65,
      type: "pattern",
    },
  ];
}

let cachedData: AppData | null = null;

export function generateMockData(): AppData {
  if (cachedData) return cachedData;

  const employees = generateEmployees();
  const inventory = generateInventory(employees);
  const events = generateEvents(inventory, employees);
  const alerts = generateAlerts(inventory);
  const kitchenWastage = generateKitchenWastage();
  const auditReports = generateAuditReports(employees);
  const aiInsights = generateAIInsights(inventory);

  cachedData = {
    outlets: OUTLETS,
    employees,
    inventory,
    events,
    alerts,
    kitchenWastage,
    auditReports,
    aiInsights,
  };

  return cachedData;
}

export function getOpeningStocks(inventory: InventoryItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of inventory) {
    // Opening stock ~10-20% higher than current for variance demo
    const boost = item.name === "Black Dog" && item.outletId === "outlet-a" ? 38 : randInt(5, 25);
    map.set(item.id, item.currentStock + boost);
  }
  return map;
}
