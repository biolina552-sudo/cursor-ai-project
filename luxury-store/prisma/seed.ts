import { PrismaClient } from "@prisma/client";
import { categories, products } from "../src/lib/data";
import { supportedCountries } from "../src/lib/regions";

const prisma = new PrismaClient();

async function main() {
  for (const country of supportedCountries) {
    await prisma.country.upsert({
      where: { code: country.code },
      create: {
        code: country.code,
        name: country.name,
        nameAr: country.nameAr,
        currency: country.currency,
        taxRate: country.taxRate,
        shippingZones: {
          create: {
            name: `${country.name} standard`,
            baseRate: country.shippingFrom,
            expressRate: country.shippingFrom * 2,
            freeOver: 500,
          },
        },
      },
      update: {
        name: country.name,
        nameAr: country.nameAr,
        currency: country.currency,
        taxRate: country.taxRate,
      },
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.id },
      create: {
        slug: category.id,
        name: category.name,
        nameAr: category.nameAr,
      },
      update: {
        name: category.name,
        nameAr: category.nameAr,
      },
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.category },
    });
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        slug: product.slug,
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        priceUsd: product.priceUsd,
        sku: product.id.toUpperCase(),
        inventory: product.inventory,
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        categoryId: category.id,
      },
      update: {
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        priceUsd: product.priceUsd,
        inventory: product.inventory,
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        categoryId: category.id,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
