import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, price, features } = body;

    if (!name || price === undefined || !features) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        price,
        features,
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}