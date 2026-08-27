import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const keys = await redis.keys("player:*");
    const players = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        // Upstash auto-parses JSON — only JSON.parse if data is a string
        players.push(typeof data === "string" ? JSON.parse(data) : data);
      }
    }

    return NextResponse.json(players);
  } catch (err) {
    console.error("GET /api-internal/player failed:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const playerData = {
      id: body.id,
      name: body.name,
      x: body.x ?? 0,
      y: body.y ?? 0,
      z: body.z ?? 0,
      rotation: body.rotation ?? 0,
      updatedAt: Date.now(),
    };

    // Upstash-style — swap for `.set(key, value, "EX", 50)` if you're on ioredis
    await redis.set(`player:${body.id}`, JSON.stringify(playerData), { ex: 50 });

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

    if (!id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await redis.del(`player:${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api-internal/player failed:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}