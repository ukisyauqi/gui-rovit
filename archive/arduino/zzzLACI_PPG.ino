#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer *pServer = NULL;
BLECharacteristic *pSensorCharacteristic = NULL;
BLECharacteristic *pLedCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
char A_ENA = 13;
char A_IN1 = 12;
char A_IN2 = 14;
char A_IN3 = 27;
char A_IN4 = 26;
char A_ENB = 25;
char B_ENA = 33;
char B_IN1 = 32;
char B_IN2 = 15;

unsigned short value = 0

#define SERVICE_UUID "19b10000-e8f2-537e-4f6c-d104768a1214"
#define SENSOR_CHARACTERISTIC_UUID "19b10001-e8f2-537e-4f6c-d104768a1214"
#define LED_CHARACTERISTIC_UUID "19b10002-e8f2-537e-4f6c-d104768a1214"

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks
{
  void buka(int pin1, int pin2)
  {
    digitalWrite(pin1, HIGH);
    digitalWrite(pin2, LOW);
  }
  void tutup(int pin1, int pin2)
  {
    digitalWrite(pin1, LOW);
    digitalWrite(pin2, HIGH);
  }
  void diam(int pin1, int pin2)
  {
    digitalWrite(pin1, LOW);
    digitalWrite(pin2, LOW);
  }

  void onWrite(BLECharacteristic *pLedCharacteristic)
  {
    std::string value = pLedCharacteristic->getValue();
    if (value.length() > 0)
    {
      int receivedValue = static_cast<int>(value[0]);

      switch (receivedValue)
      {
      case 0:
        diam(12, 14);
        diam(27, 26);
        diam(32, 15);
        break;
      case 1:
        buka(12, 14);
        break;
      case 2:
        tutup(12, 14);
        break;
      case 3:
        buka(27, 26);
        break;
      case 4:
        tutup(27, 26);
        break;
      case 5:
        buka(32, 15);
        break;
      case 6:
        tutup(32, 15);
        break;
      default:
        Serial.println("Command not registered");
        break;
      }
    }
  }
};

void setup()
{
  Serial.begin(115200);

  Serial.println(A_ENA);

  // Create Server
  BLEDevice::init("ESP32");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristic
  pSensorCharacteristic = pService->createCharacteristic(
      SENSOR_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);
  pLedCharacteristic = pService->createCharacteristic(
      LED_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_WRITE);

  // Register Callback
  pLedCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // Create a BLE Descriptor
  pSensorCharacteristic->addDescriptor(new BLE2902());
  pLedCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
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

void loop()
{
  delay(1000);
  if (deviceConnected)
  {
    pSensorCharacteristic->setValue(String(value).c_str());
    pSensorCharacteristic->notify();
    value++;
    Serial.print("New value notified: ");
    Serial.println(value);
    delay(3000); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  }

  if (!deviceConnected && oldDeviceConnected)
  {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected)
  {
    oldDeviceConnected = deviceConnected;
  }
}