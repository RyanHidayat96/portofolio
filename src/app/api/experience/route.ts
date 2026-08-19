import { experience } from "@/data/experience";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({ experience });
}
