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
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        width: "100%"
      }}
    >
      <div
        style={{
          background: "#211406",
          borderBottom: "4px solid #6b4512",
          height: "18px",
          left: "20px",
          position: "absolute",
          right: "20px",
          top: "20px"
        }}
      />
      <span
        style={{
          color: "#ffb000",
          fontFamily: "monospace",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: "-8px",
          lineHeight: 1,
          marginTop: "18px"
        }}
      >
        &gt;_
      </span>
    </div>,
    size
  );
}
