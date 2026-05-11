import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncUser } from "@/lib/syncUser";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await syncUser();
    const body = await req.json();

    const { name, description, workflowData } = body;

    // Verify task belongs to user
    const existingTask = await prisma.agentTask.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== user.clerkId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const task = await prisma.agentTask.update({
      where: { id },
      data: {
        name,
        description,
        workflowData,
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error("PUT Task error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await syncUser();

    // Verify task belongs to user
    const existingTask = await prisma.agentTask.findUnique({
      where: { id },
    });

    if (!existingTask || existingTask.userId !== user.clerkId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.agentTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Task error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
