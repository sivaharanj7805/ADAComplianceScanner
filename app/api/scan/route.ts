import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Please use /api/scan/free for free scans or /api/scan/trigger for authenticated scans." },
    { status: 400 }
  );
}
