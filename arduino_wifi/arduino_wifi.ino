#include <Servo.h>
#include <WiFiS3.h>
#include <PubSubClient.h>
#include <ArduinoHttpClient.h>
#define NUM_SENSORS 5
#define NUM_LEDRED 5
#define NUM_LEDGREN 5

const int sensorPin[NUM_SENSORS] = {0,1,2,3,4};
const int redPin[NUM_LEDRED] = {5,6,7,8,9};
const int greenPin[NUM_LEDGREN] = {10,11,12,13,A0};
const int sensorPinToId[NUM_SENSORS] = {1, 3, 5, 7, 9};

const char* ssid = "INFINITUM8A1C_2.4";
const char* password = "g8qTIzqvw9"; 
const char* mqtt_server = "192.168.1.75";
const char* serverAddress = "192.168.1.75";
int serverPort = 8080;

WiFiClient espClient1;
WiFiClient espClient2;
PubSubClient client(espClient1);
HttpClient httpClient = HttpClient(espClient2, serverAddress, serverPort);

unsigned long lastStateChangeTime[NUM_SENSORS] = {0};
int lastState[NUM_SENSORS] = {-1};

Servo myservo;
int servoPin = A1;
int posOpen = 15;
int posClose = 135;

void setup() {
  Serial.begin(9600);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  client.setServer(mqtt_server, 1883);

  client.setCallback(callback);  // set the MQTT callback function

  myservo.attach(servoPin);

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

    if (value != lastState[i] && millis() - lastStateChangeTime[i] > 2000) {
      lastState[i] = value;
      lastStateChangeTime[i] = millis();

      char message[50];
      sprintf(message, "{\"id\":%d, \"state\":%d}", sensorPinToId[i], value);  // Use the mapped ID

      if (value == LOW) {
        // Si el sensor está tapado
        Serial.println("Espacio Ocupado");  //zona oscura
        digitalWrite(redPin[i], HIGH);
        digitalWrite(greenPin[i], LOW);
        updateParkingSpotStatus(sensorPinToId[i], "occupied");
      } else {
        // Si el sensor no está tapado
        digitalWrite(greenPin[i], HIGH);
        digitalWrite(redPin[i], LOW);
        Serial.println("Espacio Libre");  //zona libre
        updateParkingSpotStatus(sensorPinToId[i], "unoccupied");
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
      client.subscribe("parking/pen");  // Add this line
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.println("Callback triggered");
  String topicStr = topic; 
  String payloadStr;

  for (int i = 0; i < length; i++) {
    payloadStr += (char)payload[i];
  }

  Serial.print("Received message on topic: ");
  Serial.println(topicStr);
  Serial.print("Message payload: ");
  Serial.println(payloadStr);

  if(topicStr == "parking/pen"){
    if(payloadStr == "open"){
      Serial.println("Received 'open' command");
      myservo.write(posOpen);
    }else if(payloadStr == "close"){
      Serial.println("Received 'close' command");
      myservo.write(posClose);
    }
  }
}



void updateParkingSpotStatus(int spotId, const char* status) {
  if(WiFi.status()== WL_CONNECTED){
    String path = "/status/" + String(status) + "/" + String(spotId);

    Serial.print("Requesting path: ");
    Serial.println(path);

    httpClient.get(path);

    int statusCode = httpClient.responseStatusCode();
    String response = httpClient.responseBody();

    Serial.print("Status code: ");
    Serial.println(statusCode);
    Serial.print("Response: ");
    Serial.println(response);

    if (statusCode != 200) {
      Serial.println("Failed to update parking spot status");
    }
  }
  else{
    Serial.println("WiFi Disconnected");
  }
}
