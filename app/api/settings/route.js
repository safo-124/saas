import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Create an array of update promises to run in a transaction
    const updatePromises = Object.entries(body).map(([key, value]) => 
      prisma.setting.update({
        where: { key },
        data: { value: String(value) },
      })
    );
    
    // Run all updates in a single transaction
    await prisma.$transaction(updatePromises);

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}