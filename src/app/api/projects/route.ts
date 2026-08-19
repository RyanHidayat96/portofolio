import { projects } from "@/data/projects";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({ projects });
}
