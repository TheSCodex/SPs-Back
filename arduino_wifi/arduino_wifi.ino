#include <WiFiS3.h>
#include <PubSubClient.h>
#define NUM_SENSORS 1

const int sensorPin[NUM_SENSORS] = {2};
const int redPin[NUM_SENSORS] = {5};
const int greenPin[NUM_SENSORS] = {6};

const char* ssid = "Totalplay-5DAA";
const char* password = "5DAAD5479GTARA2X"; 
const char* mqtt_server = "192.168.100.94";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastStateChangeTime[NUM_SENSORS] = {0};
int lastState[NUM_SENSORS] = {-1}; // Initialize to an invalid state

void setup() {
  Serial.begin(9600);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  client.setServer(mqtt_server, 1883);
  for(int i=0; i<NUM_SENSORS; i++){
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

  for(int i=0; i<NUM_SENSORS; i++){
    int value = digitalRead(sensorPin[i]);  //lectura digital de pin

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
