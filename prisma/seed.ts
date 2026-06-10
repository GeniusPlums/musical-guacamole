import { PrismaClient } from "@prisma/client";
import { generateMockData } from "../src/lib/mock-data/generator";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BarIQ database...");

  await prisma.stockEvent.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.auditReport.deleteMany();
  await prisma.kitchenWastage.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.outlet.deleteMany();

  const data = generateMockData();

  for (const outlet of data.outlets) {
    await prisma.outlet.create({ data: outlet });
  }

  for (const employee of data.employees) {
    await prisma.employee.create({ data: employee });
  }

  for (const item of data.inventory) {
    await prisma.inventoryItem.create({
      data: {
        ...item,
        category: item.category === "Kitchen Ingredients" ? "KitchenIngredients" : item.category,
      },
    });
  }

  for (const event of data.events) {
    await prisma.stockEvent.create({ data: event });
  }

  for (const alert of data.alerts) {
    await prisma.alert.create({ data: alert });
  }

  for (const kw of data.kitchenWastage) {
    await prisma.kitchenWastage.create({
      data: {
        name: kw.name,
        purchased: kw.purchased,
        used: kw.used,
        spoiled: kw.spoiled,
        unaccounted: kw.unaccounted,
        unit: kw.unit,
        costPerUnit: kw.costPerUnit,
        outletId: kw.outletId,
      },
    });
  }

  for (const report of data.auditReports) {
    await prisma.auditReport.create({
      data: {
        weekStart: report.weekStart,
        weekEnd: report.weekEnd,
        inventoryLoss: report.inventoryLoss,
        topMissingProducts: report.topMissingProducts,
        highestVarianceShift: report.highestVarianceShift,
        highestVarianceEmployee: report.highestVarianceEmployee,
        outletComparison: report.outletComparison ?? undefined,
        outletId: report.outletId,
      },
    });
  }

  console.log(`Seeded ${data.inventory.length} inventory items`);
  console.log(`Seeded ${data.events.length} stock events`);
  console.log(`Seeded ${data.employees.length} employees`);
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
