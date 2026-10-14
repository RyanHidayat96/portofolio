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
        background: "#0b0703",
        border: "2px solid #ffb000",
        color: "#ffe4a3",
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
