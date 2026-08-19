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
        background: "#06070a",
        border: "8px solid #37f2a5",
        color: "#f4f7fb",
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
