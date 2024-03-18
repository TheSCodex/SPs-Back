void loop(){
  // Verificar si hay un cliente conectado
  WiFiClient client = server.available();
  if (client) {
    while(!client.available()){
      delay(1);
    }

    // Revisar request
    String request = client.readStringUntil('\r');
    client.flush();

    // Match the request
    if (request.indexOf("/LED=ON") != -1) {
      digitalWrite(redPin, HIGH);
      digitalWrite(greenPin, LOW);
      client.println("LED is on");
    }
    if (request.indexOf("/LED=OFF") != -1) {
      digitalWrite(greenPin, HIGH);
      digitalWrite(redPin, LOW);
      client.println("LED is off");
    }
  }

  int value = digitalRead(sensorPin);  //lectura digital de pin

  // Print the value read from the sensor
  Serial.print("Sensor value: ");
  Serial.println(value);

  if (value == LOW) {
    // Si el sensor está tapado
    if (millis() - lastActivationTime > 3000) { // Si han pasado más de 3 segundos desde la última activación
      Serial.println("Espacio Ocupado");  //zona oscura
      digitalWrite(redPin, HIGH);
      digitalWrite(greenPin, LOW);
    }
  } else {
    // Si el sensor no está tapado, actualiza el tiempo de última activación
    lastActivationTime = millis();
    digitalWrite(greenPin, HIGH);
    digitalWrite(redPin, LOW);
    Serial.println("Espacio Libre");  //zona libre
  }
  delay(1000);
}
