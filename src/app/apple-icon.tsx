import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180
};

export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0b0703",
        border: "8px solid #ffb000",
        color: "#ffe4a3",
        display: "flex",
        fontSize: 96,
        fontWeight: 800,
        height: "100%",
        justifyContent: "center",
        width: "100%"
      }}
    >
      R
    </div>,
    size
  );
}
