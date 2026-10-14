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
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "4px",
        position: "relative",
        width: "100%"
      }}
    >
      <div
        style={{
          background: "#211406",
          borderBottom: "1px solid #6b4512",
          height: "3px",
          left: "4px",
          position: "absolute",
          right: "4px",
          top: "4px"
        }}
      />
      <span
        style={{
          color: "#ffb000",
          fontFamily: "monospace",
          fontSize: 18,
          fontWeight: 800,
          lineHeight: 1,
          marginTop: "3px"
        }}
      >
        &gt;_
      </span>
    </div>,
    size
  );
}
