# ⛏️ IoT-Based Coal Mine Safety Monitoring System

A real-time coal mine safety monitoring prototype that simulates gas detection, temperature and humidity monitoring, fire alerts, and automatic ventilation control using Arduino, Wokwi, Python, and React.

## 📌 Project Overview

Coal mines can be exposed to dangerous gas concentrations, rising temperatures, and fire hazards. This project demonstrates how an IoT-based monitoring system can detect simulated unsafe conditions, trigger local alerts, and display sensor readings on a live web dashboard.

The system combines a simulated hardware circuit with a web-based interface for monitoring environmental conditions and visualizing sensor history.

## 🎯 Objectives

- Monitor gas sensor readings, temperature, and humidity.
- Detect simulated fire using a push button.
- Trigger a buzzer and warning LEDs when danger conditions are detected.
- Simulate automatic ventilation flap control using a servo motor.
- Display live readings and safety status on a React dashboard.
- Visualize sensor history using a line chart with separate Y-axes.

## 🏗️ System Architecture

```text
   Gas Sensor (MQ-2) ─────┐
   Temperature Sensor ────┤
   Humidity Sensor ───────┤
   Fire Detection Button ─┘
              │
              ▼
       Arduino UNO
     Sensor Processing
     Safety Thresholds
              │
       ┌──────┴──────┐
       ▼             ▼
  Local Alerts    Servo Motor
  LED + Buzzer    Ventilation
       │
       ▼
   Wokwi Serial Output
       │
       ▼
   Python Serial Bridge
       │
       ▼
     WebSocket
       │
       ▼
   React Dashboard
       │
       ├── Live Sensor Cards
       ├── Safety Status
       ├── Sensor History Graph
       └── Servo Position
```

## 🧰 Technologies Used

| Technology | Purpose |
|---|---|
| Arduino UNO | Sensor processing and safety logic |
| Wokwi | Circuit design and hardware simulation |
| MQ-2 gas sensor | Simulated gas-level readings |
| DHT22 | Temperature and humidity readings |
| LEDs and buzzer | Local warning indicators |
| SG90 servo | Simulated ventilation flap |
| C++ / Arduino | Embedded system programming |
| Python | Serial-to-WebSocket bridge |
| React | Dashboard interface |
| Recharts | Sensor history line graph |
| CSS | Dashboard styling |

## ✨ Key Features

### 1. Environmental Monitoring
Reads gas sensor ADC values, temperature, and humidity from the simulated sensors.

### 2. Fire and Gas Alerts
Evaluates sensor readings and the fire detection input against demonstration thresholds. Warning LEDs and the buzzer activate when a danger condition is detected.

### 3. Automatic Ventilation Simulation
The servo moves to 90° when the Arduino detects danger and returns to 0° when conditions are safe.

### 4. Live Web Dashboard
A dark industrial-themed dashboard displays current sensor readings, connection status, alerts, and ventilation flap position.

### 5. Sensor History Visualization
A live line chart shows recent gas and temperature readings over time, with separate Y-axes for their different units and scales.

## 📂 Project Structure

```text
coal-mine-safety-monitoring/
├── .gitignore
├── coal-mine-iot/
│   ├── bridge.py
│   ├── diagram.json
│   ├── libraries.txt
│   ├── wokwi.toml
│   └── sketch/
│       └── sketch.ino
└── coal-mine-dashboard/
    ├── public/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── package.json
    └── package-lock.json
```

## ⚙️ Setup and Execution

### Prerequisites

- Node.js and npm
- Python 3
- Arduino CLI
- Visual Studio Code
- Wokwi Simulator extension and an appropriate license
- Git

### Step 1: Start the Arduino Simulation

Open `coal-mine-iot` in VS Code, compile the Arduino sketch, and start the Wokwi simulation. Keep the simulator visible and running.

### Step 2: Start the Python Bridge

Open a terminal in the `coal-mine-iot` directory:

```bash
source .venv/bin/activate
python bridge.py
```

The bridge reads serial data from Wokwi through the RFC2217 connection and broadcasts parsed sensor readings through a WebSocket server at `ws://127.0.0.1:8765`.

If setting up on a new computer, create the Python virtual environment and install the required packages first.

### Step 3: Start the React Dashboard

Open another terminal and run:

```bash
cd coal-mine-dashboard
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173/`.

### Step 4: Test the System

- Adjust the simulated gas sensor.
- Change the DHT22 temperature and humidity values.
- Press the fire detection button.
- Observe the LEDs, buzzer, and servo.
- Verify that readings and status changes appear on the dashboard.

## 🔌 Demonstration Pin Configuration

| Component | Arduino connection |
|---|---|
| MQ-2 analog output | A0 |
| DHT22 data | D2 |
| Fire button | D4 |
| Green LED | D5 |
| Red LED | D6 |
| Buzzer | D7 |
| Servo signal | D8 |

Use the project's `diagram.json` as the reference for the complete circuit wiring.

## 📊 Safety Logic

The current demonstration uses a gas ADC threshold of 600 and a temperature threshold of 45°C. A detected fire input or sensor-reading error also triggers the danger state.

These values are for simulation and educational demonstration only. The MQ-2 ADC reading is not a calibrated gas concentration in ppm.

## 🚀 Future Scope

- Integrate real sensors and a physical microcontroller.
- Add secure cloud-based monitoring and remote notifications.
- Store sensor readings in a database for long-term analysis.
- Add historical charts, reports, and event logs.
- Explore additional mine-safety sensors, such as methane-specific sensors.
- Improve reliability, calibration, fault detection, and system security.

## 🎓 Project Purpose

This project demonstrates the integration of embedded systems, IoT communication, sensor monitoring, data visualization, and web development in an educational coal mine safety prototype.

**Disclaimer:** This is a simulation and academic prototype, not a certified mine-safety system. It must not be used to protect people in an actual mine.

## 👨‍💻 Author

**Phulesh Sirvi**

GitHub: [@phuleshsirvi](https://github.com/phuleshsirvi)
