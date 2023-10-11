// BIRO IJO KUNING : kiri tengah kanan : ground vcc data32
#if defined(ESP32)
#include <WiFi.h>
#include <FirebaseESP32.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#endif

#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

#define WIFI_SSID "uki"
#define WIFI_PASSWORD "ukiukiuki"

#define API_KEY "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM"
#define DATABASE_URL "https://gui-rovit-default-rtdb.asia-southeast1.firebasedatabase.app/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

int PulseSensorPurplePin = 32;

bool recording = false;

int prep_size = 300;
int rec_size = 1000;

int i = 0;

FirebaseJsonArray Signal;
FirebaseJson ppg;

unsigned long pm;

int timestamp;

void setup() {
  Serial.begin(115200);

  setupWifiAndFirebase();

  delay(1000);
}

void loop() {
  if (Firebase.ready()) {
    Firebase.RTDB.getBool(&fbdo, "recording/state");
    recording = fbdo.boolData();

    int sample;
    if (recording) {
      Firebase.RTDB.getString(&fbdo, "recording/timestamp");
      String timeStamp = fbdo.stringData();

      ppg.clear();
      Signal.clear();

      // preparation
      for (i = 0; i < prep_size; i++) {
        sample = analogRead(PulseSensorPurplePin);
        Serial.println(sample);
        delay(10);
      }

      // recording
      Serial.println("recording...");
      pm = millis();
      for (i = 0; i < rec_size; i++) {
        delay(10);
        sample = analogRead(PulseSensorPurplePin);
        Serial.print("recording... ");
        Serial.println(sample);
        Signal.add(sample);
      }
      ppg.set("elapsed-time", millis() - pm);

      String str_signal;
      Signal.toString(str_signal);

      ppg.set("signal", str_signal);
      ppg.set("timestamp", timeStamp);

      Firebase.RTDB.setBool(&fbdo, "recording/state", false);
      Firebase.RTDB.updateNode(&fbdo, "ppg-database/" + timeStamp, &ppg);
      Firebase.RTDB.set(&fbdo, "ppg", &ppg);

      delay(2000);
    }
    sample = analogRead(PulseSensorPurplePin);
    Serial.println(sample);
    Firebase.RTDB.setInt(&fbdo, "ppg/sample", sample);
  }

  delay(100);
}

void setupWifiAndFirebase() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);

  /* Sign Up Anonymous User*/
  Serial.print("Sign up new user... ");
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
    signupOK = true;
  } else
    Serial.printf("%s\n", config.signer.signupError.message.c_str());

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
}
