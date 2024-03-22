#include <WiFiS3.h>
#include <PubSubClient.h>

const int sensorPin[1] = {4};
const int redPin[1] = {2};
const int greenPin[1] = {3};

const char* ssid = "SM51";
const char* password = "as1anSM51*"; 
const char* mqtt_server = "192.168.3.204";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastStateChangeTime[1] = {0};
int lastState[1] = {-1}; // Initialize to an invalid state

void setup() {
  Serial.begin(9600);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  client.setServer(mqtt_server, 1883);
  for(int i=0; i<1; i++){
    pinMode(redPin[i], OUTPUT);
    pinMode(greenPin[i], OUTPUT);
    pinMode(sensorPin[i], INPUT);
  }
}

void loop(){
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  for(int i=0; i<1; i++){
    int value = digitalRead(sensorPin[i]);  //lectura digital de pin

    // Print the value read from the sensor
    Serial.print("Sensor value: ");
    Serial.println(value);
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    if (value != lastState[i] && millis() - lastStateChangeTime[i] > 2000) {
      lastState[i] = value;
      lastStateChangeTime[i] = millis();

      char message[50];
      sprintf(message, "{\"id\":%d, \"state\":%d}", sensorPin[i], value);

      if (value == LOW) {
        // Si el sensor está tapado
        Serial.println("Espacio Ocupado");  //zona oscura
        digitalWrite(redPin[i], HIGH);
        digitalWrite(greenPin[i], LOW);
      } else {
        // Si el sensor no está tapado
        digitalWrite(greenPin[i], HIGH);
        digitalWrite(redPin[i], LOW);
        Serial.println("Espacio Libre");  //zona libre
      }
      client.publish("arduino/sensor", message);
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
