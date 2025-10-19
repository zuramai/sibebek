/*********
  Sibebek Farm Monitoring with MQTT
  Modified to publish sensor data to MQTT broker
*********/

// Import required libraries
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// Replace with your network credentials
const char* ssid = "sibebek";
const char* password = "1234567890";

// MQTT Broker settings
const char* mqtt_server = "150.109.25.181";
const int mqtt_port = 1883;
const char* mqtt_topic_temp = "sibebek/temperature";
const char* mqtt_topic_humidity = "sibebek/humidity";
const char* mqtt_topic_ammonia = "sibebek/ammonia";

#define DHTPIN 5     // Digital pin connected to the DHT sensor
#define AMMONIA_PIN A0  // Analog pin for ammonia sensor (MQ-137 or similar)

// Uncomment the type of sensor in use:
#define DHTTYPE DHT11     // DHT 11

DHT dht(DHTPIN, DHTTYPE);

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// current sensor values
float t = 0.0;
float h = 0.0;
float ammonia = 0.0;

// Generally, you should use "unsigned long" for variables that hold time
unsigned long previousMillis = 0;
// Updates sensor readings every 5 seconds
const long interval = 5000;  

// Function to connect to WiFi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// Function to reconnect to MQTT broker
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

// Function to read ammonia gas sensor (simulated for now if no physical sensor)
float readAmmoniaGas() {
  // Read analog value from MQ-137 or similar ammonia sensor
  int sensorValue = analogRead(AMMONIA_PIN);
  
  // Convert to ppm (this conversion depends on your specific sensor)
  // This is a simplified conversion - calibrate based on your sensor datasheet
  float voltage = sensorValue * (3.3 / 1024.0);
  float ppm = (voltage / 3.3) * 100; // Simplified calculation
  
  return ppm;
}

void setup() {
  // Serial port for debugging purposes
  Serial.begin(115200);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  setup_wifi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  
  Serial.println("Setup complete - ready to publish sensor data");
}

void loop() {
  // Ensure MQTT connection is maintained
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    // save the last time you updated the sensor values
    previousMillis = currentMillis;
    
    // Read temperature as Celsius
    float newT = dht.readTemperature();
    if (isnan(newT)) {
      Serial.println("Failed to read from DHT sensor Temperature!");
    } else {
      t = newT;
      Serial.print("Temperature: ");
      Serial.print(t);
      Serial.println(" °C");
      
      // Publish temperature to MQTT
      char tempString[8];
      dtostrf(t, 1, 2, tempString);
      client.publish(mqtt_topic_temp, tempString);
    }
    
    // Read Humidity
    float newH = dht.readHumidity();
    if (isnan(newH)) {
      Serial.println("Failed to read from DHT sensor Humidity!");
    } else {
      h = newH;
      Serial.print("Humidity: ");
      Serial.print(h);
      Serial.println(" %");
      
      // Publish humidity to MQTT
      char humString[8];
      dtostrf(h, 1, 2, humString);
      client.publish(mqtt_topic_humidity, humString);
    }
    
    // Read Ammonia Gas
    float newAmmonia = readAmmoniaGas();
    ammonia = newAmmonia;
    Serial.print("Ammonia Gas: ");
    Serial.print(ammonia);
    Serial.println(" ppm");
    
    // Publish ammonia to MQTT
    char ammoniaString[8];
    dtostrf(ammonia, 1, 2, ammoniaString);
    client.publish(mqtt_topic_ammonia, ammoniaString);
    
    Serial.println("---");
  }
}
