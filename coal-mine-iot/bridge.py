
import asyncio
import json
import serial
from websockets.asyncio.server import serve

SERIAL_URL = "rfc2217://localhost:4000"
BAUD_RATE = 9600
HOST = "127.0.0.1"
PORT = 8765

clients = set()


async def websocket_handler(websocket):
    clients.add(websocket)
    print("Dashboard connected")

    try:
        await websocket.wait_closed()
    finally:
        clients.discard(websocket)
        print("Dashboard disconnected")


def parse_value(value):
    if value == "null":
        return None
    try:
        return float(value) if "." in value else int(value)
    except ValueError:
        return value


async def main():
    print("Connecting to Wokwi serial port...")

    with serial.serial_for_url(
        SERIAL_URL, baudrate=BAUD_RATE, timeout=1
    ) as ser:
        print("Serial connected:", SERIAL_URL)

        async with serve(websocket_handler, HOST, PORT):
            print(f"WebSocket ready at ws://{HOST}:{PORT}")
            print("Waiting for DATA records...")

            while True:
                raw = await asyncio.to_thread(ser.readline)
                if not raw:
                    continue

                line = raw.decode("utf-8", errors="replace").strip()

                if not line.startswith("DATA,"):
                    print("Serial:", line)
                    continue

                fields = line.split(",")
                if len(fields) != 7:
                    print("Skipping malformed record:", line)
                    continue

                payload = {
                    "gas": parse_value(fields[1]),
                    "temperature": parse_value(fields[2]),
                    "humidity": parse_value(fields[3]),
                    "fire": parse_value(fields[4]),
                    "status": fields[5],
                    "servo": parse_value(fields[6]),
                }

                message = json.dumps(payload)
                print("Live data:", message)

                for client in list(clients):
                    try:
                        await client.send(message)
                    except Exception:
                        clients.discard(client)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nBridge stopped.")
    except Exception as error:
        print(f"Bridge error: {error}")
        raise
