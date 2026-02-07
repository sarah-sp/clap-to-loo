import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export interface TrainService {
  std: string;
  etd: string;
  platform: string | null;
  destination: { locationName: string }[];
  operator: string;
}

function buildSoapRequest(token: string, from: string, to: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:typ="http://thalesgroup.com/RTTI/2013-11-28/Token/types"
               xmlns:ldb="http://thalesgroup.com/RTTI/2021-11-01/ldb/">
  <soap:Header>
    <typ:AccessToken>
      <typ:TokenValue>${token}</typ:TokenValue>
    </typ:AccessToken>
  </soap:Header>
  <soap:Body>
    <ldb:GetDepartureBoardRequest>
      <ldb:numRows>15</ldb:numRows>
      <ldb:crs>${from}</ldb:crs>
      <ldb:filterCrs>${to}</ldb:filterCrs>
      <ldb:filterType>to</ldb:filterType>
    </ldb:GetDepartureBoardRequest>
  </soap:Body>
</soap:Envelope>`;
}

function extractText(xml: string, tag: string): string | null {
  const regex = new RegExp(`<[^>]*:?${tag}[^>]*>([^<]*)<`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function parseServices(xml: string): TrainService[] {
  const services: TrainService[] = [];
  const serviceRegex = /<lt\d*:service>([\s\S]*?)<\/lt\d*:service>/gi;
  let match;

  while ((match = serviceRegex.exec(xml)) !== null) {
    const serviceXml = match[1];
    const std = extractText(serviceXml, "std") || "";
    const etd = extractText(serviceXml, "etd") || "";
    const platform = extractText(serviceXml, "platform");
    const operator = extractText(serviceXml, "operator") || "";

    const destMatch = serviceXml.match(/<lt\d*:destination>[\s\S]*?<lt\d*:locationName>([^<]*)</i);
    const locationName = destMatch ? destMatch[1] : "Unknown";

    services.push({
      std,
      etd,
      platform,
      destination: [{ locationName }],
      operator,
    });
  }

  return services;
}

export async function GET(request: NextRequest) {
  const token = process.env.DARWIN_TOKEN;
  const searchParams = request.nextUrl.searchParams;
  const direction = searchParams.get("direction") || "to-waterloo";

  const from = direction === "to-waterloo" ? "CLJ" : "WAT";
  const to = direction === "to-waterloo" ? "WAT" : "CLJ";

  if (!token) {
    return NextResponse.json(
      { error: "DARWIN_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb12.asmx",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "http://thalesgroup.com/RTTI/2012-01-13/ldb/GetDepartureBoard",
        },
        body: buildSoapRequest(token, from, to),
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("SOAP API error:", response.status, text);
      throw new Error(`API responded with status ${response.status}`);
    }

    const xml = await response.text();

    if (xml.includes("soap:Fault")) {
      const faultString = extractText(xml, "faultstring");
      throw new Error(faultString || "SOAP Fault");
    }

    const services = parseServices(xml);
    const locationName = extractText(xml, "locationName") || (direction === "to-waterloo" ? "Clapham Junction" : "London Waterloo");
    const generatedAt = extractText(xml, "generatedAt") || new Date().toISOString();

    return NextResponse.json({
      trainServices: services,
      locationName,
      generatedAt,
      direction,
    });
  } catch (error) {
    console.error("Failed to fetch departures:", error);
    return NextResponse.json(
      { error: "Failed to fetch train data" },
      { status: 500 }
    );
  }
}
