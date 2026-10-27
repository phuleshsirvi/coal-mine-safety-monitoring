
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import "./App.css";

const initialData = {
  gas: null,
  temperature: null,
  humidity: null,
  fire: false,
  status: "WAITING",
  servo: 0,
};

export default function App() {
  const [data, setData] = useState(initialData);
  const [history, setHistory] = useState([]);
  const [connection, setConnection] = useState("connecting");

  useEffect(() => {
    let socket;
    let retryTimer;
    let stopped = false;

    function connect() {
      if (stopped) return;

      setConnection("connecting");
      socket = new WebSocket("ws://127.0.0.1:8765");

      socket.onopen = () => {
        setConnection("live");
      };

      socket.onmessage = (event) => {
        try {
          const incoming = JSON.parse(event.data);

          setData({
            gas: incoming.gas ?? null,
            temperature: incoming.temperature ?? null,
            humidity: incoming.humidity ?? null,
            fire: incoming.fire === 1 || incoming.fire === true,
            status: incoming.status ?? "UNKNOWN",
            servo: incoming.servo ?? 0,
          });
        } catch (error) {
          console.error("Invalid sensor message:", error);
        }
      };

      socket.onerror = () => {
        setConnection("disconnected");
      };

      socket.onclose = () => {
        setConnection("disconnected");
        if (!stopped) {
          retryTimer = setTimeout(connect, 2000);
        }
      };
    }

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (data.gas === null) return;

    setHistory((old) => [
      ...old.slice(-19),
      {
        time: new Date().toLocaleTimeString(),
        gas: data.gas,
        temperature: data.temperature,
      },
    ]);
  }, [data]);

  const danger = data.status === "DANGER";
  const connected = connection === "live";

  const display = (value, digits = 1) =>
    value === null || value === undefined
      ? "--"
      : typeof value === "number"
        ? value.toFixed(digits)
        : value;

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">INDUSTRIAL IOT · MONITORING</p>
          <h1>Coal Mine Safety</h1>
          <p className="muted">
            Environmental monitoring and emergency control
          </p>
        </div>

        <div className={`status ${danger ? "danger" : "safe"}`}>
          <span className="status-dot" />
          {data.status}
        </div>
      </header>

      <section className="banner">
        <div>
          <strong>
            {!connected
              ? "Connecting to live sensor bridge"
              : danger
                ? "Emergency condition detected"
                : "Live monitoring active"}
          </strong>
          <p>
            {!connected
              ? "Start Wokwi and the Python bridge to receive sensor data."
              : danger
                ? "A simulated danger condition has been reported by the Arduino."
                : "Sensor readings are being received from your Wokwi Arduino."}
          </p>
        </div>
        <span className="banner-icon">
          {!connected ? "…" : danger ? "⚠️" : "✓"}
        </span>
      </section>

      <section className="metrics">
        <Metric
          title="Gas sensor"
          value={display(data.gas, 0)}
          unit="ADC / 1023"
          danger={data.gas !== null && data.gas >= 600}
        />
        <Metric
          title="Temperature"
          value={display(data.temperature)}
          unit="°C"
          danger={data.temperature !== null && data.temperature >= 45}
        />
        <Metric
          title="Humidity"
          value={display(data.humidity)}
          unit="%"
        />
        <Metric
          title="Ventilation flap"
          value={`${data.servo}°`}
          unit={data.servo ? "OPEN" : "CLOSED"}
          danger={danger}
        />
      </section>

      <section className="grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Sensor history</h2>
              <p className="muted">Recent readings · live Wokwi data</p>
            </div>
            <span className="pill">{history.length} samples</span>
          </div>

          
<div className="chart line-chart">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={history}
      margin={{ top: 15, right: 18, left: 0, bottom: 5 }}
    >
      <CartesianGrid stroke="#354139" strokeDasharray="5 6" vertical={false} />

      <XAxis
        dataKey="time"
        tick={{ fill: "#A7B3A8", fontSize: 11 }}
        tickLine={false}
        axisLine={{ stroke: "#354139" }}
        minTickGap={25}
      />

      <YAxis
        yAxisId="gas"
        domain={[0, 1023]}
        ticks={[0, 250, 500, 750, 1000]}
        tick={{ fill: "#A7B3A8", fontSize: 11 }}
        tickLine={false}
        axisLine={false}
        width={43}
      />

      <YAxis
        yAxisId="temp"
        orientation="right"
        domain={["auto", "auto"]}
        tick={{ fill: "#55C9BE", fontSize: 11 }}
        tickLine={false}
        axisLine={false}
        width={45}
      />

      <Tooltip
        contentStyle={{
          background: "#111713",
          border: "1px solid #354139",
          borderRadius: "10px",
          color: "#F3F4F1",
        }}
        labelStyle={{ color: "#A7B3A8" }}
        formatter={(value, name) => [
          name === "Temperature" ? `${value} °C` : `${value} ADC`,
          name,
        ]}
      />

      <ReferenceLine
        yAxisId="gas"
        y={600}
        stroke="#FF5D57"
        strokeDasharray="6 5"
        label={{
          value: "Danger threshold",
          fill: "#FF7770",
          fontSize: 11,
          position: "insideTopLeft",
        }}
      />

      <Line
        yAxisId="gas"
        type="monotone"
        dataKey="gas"
        name="Gas"
        stroke="#FFB547"
        strokeWidth={3}
        dot={{ r: 3, fill: "#FFB547", strokeWidth: 0 }}
        activeDot={{ r: 6 }}
        isAnimationActive={false}
      />

      <Line
        yAxisId="temp"
        type="monotone"
        dataKey="temperature"
        name="Temperature"
        stroke="#55C9BE"
        strokeWidth={3}
        dot={{ r: 3, fill: "#55C9BE", strokeWidth: 0 }}
        activeDot={{ r: 6 }}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
</div>


          <div className="legend">
            <span><i className="legend-gas" /> Gas ADC</span>
            <span><i className="legend-temp" /> Temperature trend</span>
          </div>
        </article>

        <article className="panel">
          <h2>Live sensor status</h2>
          <p className="muted">
            Read-only status from the Arduino simulation.
          </p>

          <div className="control-row">
            <div>
              <strong>Connection</strong>
              <p className="muted">
                {connected ? "WebSocket connected" : "Waiting for bridge"}
              </p>
            </div>
            <span className="pill">
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          <div className="control-row">
            <div>
              <strong>Fire detector</strong>
              <p className="muted">
                {data.fire ? "Fire detected" : "No fire detected"}
              </p>
            </div>
            <span className="pill">{data.fire ? "ALERT" : "NORMAL"}</span>
          </div>

          <div className="control-row">
            <div>
              <strong>Gas reading</strong>
              <p className="muted">
                {data.gas === null ? "--" : `${data.gas} ADC`}
              </p>
            </div>
            <span className="pill">
              {data.gas === null
                ? "WAITING"
                : data.gas >= 600
                  ? "HIGH"
                  : "NORMAL"}
            </span>
          </div>

          <div className={`actuator ${danger ? "actuator-danger" : ""}`}>
            <span className="actuator-icon">↻</span>
            <div>
              <strong>Servo actuator</strong>
              <p>
                {data.servo === 90
                  ? "Ventilation flap OPEN · 90°"
                  : data.servo === 0
                    ? "Ventilation flap CLOSED · 0°"
                    : `Servo position · ${data.servo}°`}
              </p>
            </div>
          </div>
        </article>
      </section>

      <footer>
        Wokwi simulation · Raw gas ADC, not calibrated ppm ·
        Not a certified mine-safety system
      </footer>
    </main>
  );
}

function Metric({ title, value, unit, danger }) {
  return (
    <article className={`metric ${danger ? "metric-danger" : ""}`}>
      <p className="muted">{title}</p>
      <div className="metric-value">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>
      <p className="metric-note">
        {danger ? "Above demo threshold" : "Monitoring"}
      </p>
    </article>
  );
}
