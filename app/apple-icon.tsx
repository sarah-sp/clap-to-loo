import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "#003688",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 150,
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: "14px solid #E1251B",
            }}
          />
          <div
            style={{
              background: "#003688",
              padding: "8px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              zIndex: 1,
            }}
          >
            <span style={{ color: "white", fontWeight: "bold", fontSize: 44 }}>
              CtL
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
