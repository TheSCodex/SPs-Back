#include <WiFiS3.h>
#include <PubSubClient.h>

const int redPin = 2;
const int greenPin = 3;
const int sensorPin = 4;

const char* ssid = "SM51";
const char* password = "as1anSM51*"; 
const char* mqtt_server = "192.168.3.204";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastStateChangeTime = 0;
int lastState = -1; // Initialize to an invalid state

void setup() {
  Serial.begin(9600);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  client.setServer(mqtt_server, 1883);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(sensorPin, INPUT);
}

void loop(){
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  int value = digitalRead(sensorPin);  //lectura digital de pin

  // Print the value read from the sensor
  Serial.print("Sensor value: ");
  Serial.println(value);
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  if (value != lastState && millis() - lastStateChangeTime > 2000) {
    lastState = value;
    lastStateChangeTime = millis();

    if (value == LOW) {
      // Si el sensor está tapado
      Serial.println("Espacio Ocupado");  //zona oscura
      digitalWrite(redPin, HIGH);
      digitalWrite(greenPin, LOW);
      client.publish("arduino/sensor", "0");
    } else {
      // Si el sensor no está tapado
      digitalWrite(greenPin, HIGH);
      digitalWrite(redPin, LOW);
      Serial.println("Espacio Libre");  //zona libre
      client.publish("arduino/sensor", "1");
    }
  }
  delay(1000);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("arduinoClient")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
