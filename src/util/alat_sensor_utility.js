import fs from 'fs';

// generate SERVICE_UUID dari https://www.uuidgenerator.net/
export const SERVICE_UUID = [
  "19b10000-e8f2-537e-4f6c-d104768a1215",
  "3a8a0d7b-4819-4c5a-aa45-8f1b40908302",
  "169b9c41-1c5a-4710-875d-6ef46cf8c26f",
  "3ea59bbf-56b3-4fcd-8c69-e39b306b5618",
  "eda58609-e3e7-44dc-9dbe-48b47eb6d4b3",
  "2e4ee652-1836-4e1e-ba48-b11605b68fe6",
  "f0263cb9-f9f1-4c62-9dcc-f6db10a4703b",
  "a69844d7-531b-4051-985b-580e64a10a68",
  "652c3582-0f52-47fe-a173-b2d464562cff",
  "cc28c02c-d16f-4014-8429-1cbdbf70a962",
]

export const SENSOR_NAME = []
for (let i = 0; i < SERVICE_UUID.length; i++) {
  SENSOR_NAME.push(`PPG-${i + 1}`)
}

export const SENSOR_CHARACTERISTIC_UUID = []
for (const i of SERVICE_UUID) {
  const a = i.split("-")
  SENSOR_CHARACTERISTIC_UUID.push((parseInt(a[0], 16) + 1).toString(16) + i.slice(8))
}

// ~~~ GENERATE CODE ARDUINO PPG (uncomment dan jalankan)~~~

// for (let i = 0; i < SERVICE_UUID.length; i++) {
//   const fileContent = `
// #include <BLEDevice.h>
// #include <BLEServer.h>
// #include <BLEUtils.h>
// #include <BLE2902.h>

// BLEServer* pServer = NULL;
// BLECharacteristic* pSensorCharacteristic = NULL;
// BLECharacteristic* pLedCharacteristic = NULL;
// bool deviceConnected = false;
// bool oldDeviceConnected = false;
// uint32_t value = 0;
// unsigned long previousMillis = 0;

// #define SERVICE_UUID "${SERVICE_UUID[i]}"
// #define SENSOR_CHARACTERISTIC_UUID "${SENSOR_CHARACTERISTIC_UUID[i]}"

// class MyServerCallbacks: public BLEServerCallbacks {
//     void onConnect(BLEServer* pServer) {
//       deviceConnected = true;
//     };

//     void onDisconnect(BLEServer* pServer) {
//       deviceConnected = false;
//     }
// };

// class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {};

// void setup() {
//   Serial.begin(115200);
//   BLEDevice::init("${SENSOR_NAME[i]}");
//   pServer = BLEDevice::createServer();
//   pServer->setCallbacks(new MyServerCallbacks());
//   BLEService *pService = pServer->createService(SERVICE_UUID);
//   pSensorCharacteristic = pService->createCharacteristic(
//                       SENSOR_CHARACTERISTIC_UUID,
//                       BLECharacteristic::PROPERTY_READ   |
//                       BLECharacteristic::PROPERTY_WRITE  |
//                       BLECharacteristic::PROPERTY_NOTIFY |
//                       BLECharacteristic::PROPERTY_INDICATE
//                     );
//   pSensorCharacteristic->addDescriptor(new BLE2902());
//   pService->start();
//   BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
//   pAdvertising->addServiceUUID(SERVICE_UUID);
//   pAdvertising->setScanResponse(false);
//   pAdvertising->setMinPreferred(0x0);
//   BLEDevice::startAdvertising();
//   Serial.println("Waiting a client connection to notify...");
// }

// void loop() {
//     unsigned long currentMillis = millis();
//     if (deviceConnected && currentMillis - previousMillis >= 10) {
//         previousMillis = currentMillis;
//         pSensorCharacteristic->setValue(String(analogRead(32)).c_str());
//         pSensorCharacteristic->notify();
//     }
//     if (!deviceConnected && oldDeviceConnected) {
//         Serial.println("Device disconnected.");
//         delay(500);
//         pServer->startAdvertising();
//         Serial.println("Start advertising");
//         oldDeviceConnected = deviceConnected;
//     }
//     if (deviceConnected && !oldDeviceConnected) {
//         oldDeviceConnected = deviceConnected;
//         Serial.println("Device Connected");
//     }
// }
// `;

//   // File name
//   const fileName = `./arduino/${SENSOR_NAME[i]}.ino`;

//   // Write the content to the file
//   fs.writeFile(fileName, fileContent, (err) => {
//     if (err) {
//       console.error('Error writing file:', err);
//     } else {
//       console.log('File created successfully:', fileName);
//     }
//   });
// }
