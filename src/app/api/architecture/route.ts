import { architecturePresets } from "@/data/architecture";
import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({
    defaultPresetId: architecturePresets[0]?.id ?? null,
    architecture: architecturePresets
  });
}
