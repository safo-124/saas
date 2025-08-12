import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const { planId } = params;
    const body = await request.json();
    // This allows updating any combination of fields
    const { name, price, features, status } = body;

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name,
        price,
        features,
        status,
      },
    });

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}