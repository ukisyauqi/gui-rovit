#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer* pServer = NULL;
BLECharacteristic* pLedCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

#define SERVICE_UUID "19b10000-e8f2-537e-4f6c-d104768a1214"
#define SENSOR_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define LED_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"

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
    Serial.print("b");
    digitalWrite(pin1, HIGH);
    digitalWrite(pin2, LOW);
  }
  void tutup(int pin1, int pin2) {
    Serial.print("t");
    digitalWrite(pin1, LOW);
    digitalWrite(pin2, HIGH);
  }
  void diam(int pin1, int pin2) {
    Serial.print("d");
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
  delay(1000);

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}