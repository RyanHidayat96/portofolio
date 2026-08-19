import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { siteConfig } from "@/config/site";

export const alt = "Ryan Hidayat SDET and QA Automation Engineer portfolio preview";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

const highlights = ["Playwright", "Appium", "API Testing", "K6", "CI/CD"];

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        background: "#06070a",
        color: "#f4f7fb",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%"
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          width: "100%"
        }}
      >
        <div
          style={{
            color: "#37f2a5",
            display: "flex",
            fontSize: 30,
            fontWeight: 800
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            border: "1px solid #2a3442",
            color: "#a7b3c4",
            display: "flex",
            fontSize: 24,
            padding: "12px 18px"
          }}
        >
          Engineering confidence
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            color: "#37f2a5",
            display: "flex",
            fontSize: 28,
            fontWeight: 700
          }}
        >
          {profile.role} PORTFOLIO
        </div>
        <div
          style={{
            color: "#f4f7fb",
            display: "flex",
            fontSize: 86,
            fontWeight: 800,
            lineHeight: 1
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            color: "#d9e2ee",
            display: "flex",
            fontSize: 36,
            maxWidth: 900
          }}
        >
          {profile.headline}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {highlights.map((highlight) => (
          <div
            key={highlight}
            style={{
              background: "#111722",
              border: "1px solid #2a3442",
              color: "#f4f7fb",
              display: "flex",
              fontSize: 24,
              padding: "12px 16px"
            }}
          >
            {highlight}
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
