import { NextResponse } from "next/server";
import { getActiveSessionCount } from "@/lib/session-store";

export async function GET() {
  return NextResponse.json({ activeSessionCount: getActiveSessionCount() });
}
