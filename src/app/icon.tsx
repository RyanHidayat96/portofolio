import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32
};

export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#06070a",
        border: "2px solid #37f2a5",
        color: "#f4f7fb",
        display: "flex",
        fontSize: 18,
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
