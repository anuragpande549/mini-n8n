import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncUser } from "@/lib/syncUser";

export async function GET(req: NextRequest) {
  try {
    const user = await syncUser();

    const tasks = await prisma.agentTask.findMany({
      where: { userId: user.clerkId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("GET Tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await syncUser();
    const body = await req.json();

    const { name, description, workflowData } = body;

    if (!name || !workflowData) {
      return NextResponse.json(
        { error: "Name and workflowData are required" },
        { status: 400 }
      );
    }

    const task = await prisma.agentTask.create({
      data: {
        name,
        description,
        workflowData,
        userId: user.clerkId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error("POST Tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
