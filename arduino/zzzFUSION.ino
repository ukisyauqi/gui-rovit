#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <WiFi.h>
#include <FirebaseESP32.h>

#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

#include <Wire.h>

#include <Adafruit_MLX90614.h>

#define MLX90614_I2C_ADDR 0x5A

BLEServer* pServer = NULL;
BLECharacteristic* pLedCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "19b10000-e8f2-537e-4f6c-d104768a1214"
#define SENSOR_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define LED_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"

#define WIFI_SSID "rovit"
#define WIFI_PASSWORD "cognounpad"

#define API_KEY "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM"
#define DATABASE_URL "https://gui-rovit-default-rtdb.asia-southeast1.firebasedatabase.app/"

#define USER_EMAIL "rovit@gmail.com"
#define USER_PASSWORD "Unpad57"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int i = 0;

int sample;

FirebaseJsonArray arr;

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

int suhu;

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
  void buka(int pin1, int pin2) {
    digitalWrite(pin1, HIGH);
    digitalWrite(pin2, LOW);
  }
  void tutup(int pin1, int pin2) {
    digitalWrite(pin1, LOW);
    digitalWrite(pin2, HIGH);
  }
  void diam(int pin1, int pin2) {
    digitalWrite(pin1, LOW);
    digitalWrite(pin2, LOW);
  }

  void onWrite(BLECharacteristic* pLedCharacteristic) {
    std::string value = pLedCharacteristic->getValue();
    if (value.length() > 0) {
      int receivedValue = static_cast<int>(value[0]);

      if (receivedValue == 0) {
        diam(12, 14);
        diam(27, 26);
        diam(32, 15);
      } else if (receivedValue == 1) buka(12, 14);
      else if (receivedValue == 2) tutup(12, 14);
      else if (receivedValue == 3) buka(27, 26);
      else if (receivedValue == 4) tutup(27, 26);
      else if (receivedValue == 5) buka(32, 15);
      else if (receivedValue == 6) tutup(32, 15);
    }
  }
};

void setup() {
  Serial.begin(115200);

  setupWifiAndFirebase();
  Wire.begin();

  // while (!mlx.begin(MLX90614_I2C_ADDR)) {

  // }

  BLEDevice::init("ESP32");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService* pService = pServer->createService(SERVICE_UUID);
  pLedCharacteristic = pService->createCharacteristic(
    LED_CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE);
  pLedCharacteristic->setCallbacks(new MyCharacteristicCallbacks());
  // pLedCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  // Start advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();

  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(14, OUTPUT);
  pinMode(25, OUTPUT);
  pinMode(27, OUTPUT);
  pinMode(26, OUTPUT);
  pinMode(33, OUTPUT);
  pinMode(32, OUTPUT);
  pinMode(15, OUTPUT);

  digitalWrite(12, LOW);
  digitalWrite(14, LOW);
  digitalWrite(27, LOW);
  digitalWrite(26, LOW);
  digitalWrite(32, LOW);
  digitalWrite(15, LOW);

  analogWrite(13, 255);
  analogWrite(25, 255);
  analogWrite(33, 255);
}

void loop() {
  if (Firebase.ready()) {
    Firebase.RTDB.getBool(&fbdo, "P9A2G/isRecording");

    if (fbdo.boolData()) {
      arr.clear();
      suhu = 0;

      for (i = 0; i < 500; i++) {
        delay(10);
        arr.add(analogRead(15));
      }

      suhu = mlx.readObjectTempC();

      Firebase.RTDB.set(&fbdo, "P9A2G/isRecording", false);
      Firebase.RTDB.set(&fbdo, "P9A2G/signal", &arr);
      Firebase.RTDB.set(&fbdo, "P9A2G/suhu", suhu);
    }
    sample = analogRead(15);
    suhu = mlx.readObjectTempC();
    Firebase.RTDB.setInt(&fbdo, "P9A2G/sample", sample);
    Firebase.RTDB.set(&fbdo, "P9A2G/suhu", suhu);
  }
  delay(500);

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}

void setupWifiAndFirebase() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.reconnectWiFi(true);

  if (Firebase.signUp(&config, &auth, "", "")) {
  } else

    config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
}
