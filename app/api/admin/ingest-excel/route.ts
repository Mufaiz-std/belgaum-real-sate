import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility to parse prices like "1.40cr", "45L"
function parsePrice(priceStr: string | number | null | undefined): number {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;

  const normalized = priceStr.toString().toLowerCase().trim();
  
  const numPartMatch = normalized.match(/[\d\.]+/);
  if (!numPartMatch) return 0;
  
  const numPart = parseFloat(numPartMatch[0]);
  if (isNaN(numPart)) return 0;

  if (normalized.includes('cr')) {
    return numPart * 10000000;
  } else if (normalized.includes('l')) { // 'l' or 'lac' or 'lakh'
    return numPart * 100000;
  } else if (normalized.includes('k')) {
    return numPart * 1000;
  } else if (normalized.includes('m')) {
    return numPart * 1000000;
  }

  return numPart;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: 'No sheets found in Excel file' }, { status: 400 });
    }

    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
    }

    // Find a fallback Admin ownerId
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    // If no admin exists, try finding any user as fallback, or fail
    if (!adminUser) {
      adminUser = await prisma.user.findFirst();
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'No users found in the database to assign properties to.' }, { status: 500 });
    }

    const ownerId = adminUser.id;

    let totalProcessed = 0;
    let successful = 0;
    let failures = 0;
    const errors: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      totalProcessed++;

      try {
        const type = String(row['TYPE'] || '');
        const area = String(row['AREA'] || '');
        const size = String(row['SIZE'] || '');
        const rawPrice = row['PRICE'];
        const legal = String(row['LEGAL'] || '');
        const dir = String(row['DIR'] || '');
        let additional = String(row['ADDITIONAL'] || '');
        const landmark = String(row['LANDMARK'] || '');
        const dateRaw = String(row['DATE'] || '');
        const sellerType = String(row['Type'] || ''); // Note: "Type" vs "TYPE"
        const sellerName = String(row['NAME'] || '');
        const contact = String(row['Contact'] || '');

        if (!additional && landmark) {
           additional = `Landmark: ${landmark}`;
        }

        const parsedPrice = parsePrice(rawPrice);
        
        // title and slug
        const title = `${size ? size + ' ' : ''}${type} for sale in ${area}`;
        const timestamp = Date.now();
        const shortId = Math.random().toString(36).substring(2, 6);
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}-${shortId}`;

        await prisma.property.create({
          data: {
            ownerId,
            title,
            slug,
            description: additional || 'No description provided.',
            propertyType: type || 'Unknown',
            price: parsedPrice,
            priceMin: parsedPrice,
            priceMax: parsedPrice,
            area,
            dimensions: size,
            legalStatus: legal,
            facingDirection: dir,
            landmark,
            listedDateRaw: dateRaw,
            sellerType,
            sellerName,
            contactNumber: contact,
            city: 'Belagavi', // Default from schema
            status: 'ACTIVE',
            isFeatured: false,
            viewCount: 0
          }
        });
        successful++;
      } catch (err: any) {
        failures++;
        errors.push({ row: i + 2, error: err.message || 'Unknown error' }); // +2 considering header and 0-index
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed,
        successful,
        failures,
        errors
      }
    });

  } catch (error: any) {
    console.error('Error processing Excel upload:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
