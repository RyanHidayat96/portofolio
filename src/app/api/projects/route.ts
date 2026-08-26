import { projects } from "@/data/projects";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): NextResponse {
  return NextResponse.json({ projects });
}
