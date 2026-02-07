import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";

export default function Icon() {
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
        {/* Roundel */}
        <div
          style={{
            position: "relative",
            width: 160,
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Red circle */}
          <div
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "16px solid #E1251B",
            }}
          />
          {/* Blue bar with text */}
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
            <span style={{ color: "white", fontWeight: "bold", fontSize: 48 }}>
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
