
#include <DHT.h>
#include <Servo.h>

#define GAS_PIN A0
#define DHT_PIN 2
#define DHT_TYPE DHT22

#define FIRE_BUTTON 4
#define GREEN_LED 5
#define RED_LED 6
#define BUZZER 7
#define SERVO_PIN 8

// Demonstration thresholds only
const int GAS_THRESHOLD = 600;
const float TEMP_THRESHOLD = 45.0;

DHT dht(DHT_PIN, DHT_TYPE);
Servo ventilationServo;

unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL = 2000;

void setup() {
  Serial.begin(9600);

  pinMode(FIRE_BUTTON, INPUT_PULLUP);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  dht.begin();

  ventilationServo.attach(SERVO_PIN);
  ventilationServo.write(0);

  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  noTone(BUZZER);

  Serial.println("COAL MINE SAFETY MONITOR");
  Serial.println("Format: DATA,gas,temp,humidity,fire,status,servo");
}

void loop() {
  if (millis() - lastReadTime < READ_INTERVAL) {
    return;
  }

  lastReadTime = millis();

  int gasValue = analogRead(GAS_PIN);
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  bool fireDetected = digitalRead(FIRE_BUTTON) == LOW;
  bool sensorError = isnan(temperature) || isnan(humidity);

  bool gasDanger = gasValue >= GAS_THRESHOLD;
  bool tempDanger = !sensorError &&
                    temperature >= TEMP_THRESHOLD;

  bool danger = gasDanger || tempDanger ||
                fireDetected || sensorError;

  // Update safety outputs
  digitalWrite(RED_LED, danger ? HIGH : LOW);
  digitalWrite(GREEN_LED, danger ? LOW : HIGH);

  if (danger) {
    tone(BUZZER, 1000);
    ventilationServo.write(90);
  } else {
    noTone(BUZZER);
    ventilationServo.write(0);
  }

  // Structured output for the future dashboard
  Serial.print("DATA,");
  Serial.print(gasValue);
  Serial.print(",");

  if (sensorError) {
    Serial.print("null,null,");
  } else {
    Serial.print(temperature, 1);
    Serial.print(",");
    Serial.print(humidity, 1);
    Serial.print(",");
  }

  Serial.print(fireDetected ? 1 : 0);
  Serial.print(",");
  Serial.print(danger ? "DANGER" : "SAFE");
  Serial.print(",");
  Serial.println(danger ? 90 : 0);

  if (sensorError) {
    Serial.println("WARNING: DHT22 reading failed");
  }
}
