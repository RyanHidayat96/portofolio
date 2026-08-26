import { profile } from "@/data/profile";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): NextResponse {
  const contact = Object.values(profile.contact).filter(
    (link) => isPortfolioValueConfigured(link.value) && isPortfolioValueConfigured(link.href)
  );

  return NextResponse.json({ contact });
}
