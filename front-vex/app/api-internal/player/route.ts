import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// UUID v4 format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  try {
    const keys = await redis.keys("player:*");
    const players = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        players.push(typeof data === "string" ? JSON.parse(data) : data);
      }
    }
  }

return NextResponse.json(
    players
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body.id !== "string" || !UUID_REGEX.test(body.id)) {
      return NextResponse.json({ success: false, message: "Invalid player ID format" }, { status: 400 });
    }

    const safeName = typeof body.name === "string" ? body.name.slice(0, 50).trim() : "Player";
    const safeX = typeof body.x === "number" && !isNaN(body.x) ? body.x : 0;
    const safeY = typeof body.y === "number" && !isNaN(body.y) ? body.y : 0;
    const safeZ = typeof body.z === "number" && !isNaN(body.z) ? body.z : 0;
    const safeRot = typeof body.rotation === "number" && !isNaN(body.rotation) ? body.rotation : 0;

    const playerData = {
      id: body.id,
      name: safeName,
      x: safeX,
      y: safeY,
      z: safeZ,
      rotation: safeRot,
      updatedAt: Date.now(),
    };

    // ioredis style signature: (key, value, "EX", seconds)
    await redis.set(`player:${body.id}`, JSON.stringify(playerData), "EX", 50);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api-internal/player failed:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ success: false, message: "Invalid player ID" }, { status: 400 });
    }

    await redis.del(`player:${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api-internal/player failed:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}