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

#define WIFI_SSID "rovit"
#define WIFI_PASSWORD "cognounpad"

#define API_KEY "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM"
#define DATABASE_URL "https://gui-rovit-default-rtdb.asia-southeast1.firebasedatabase.app/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int i = 0;

FirebaseJsonArray Signal;
FirebaseJson ppg;

unsigned long pm;

int timestamp;
int sample;

String timeStamp;

String str_signal;

void setup() {
  Serial.begin(115200);
  setupWifiAndFirebase();
}

void loop() {
  if (Firebase.ready()) {
    Firebase.RTDB.getBool(&fbdo, "L5W1D/recording/state");
    
    if (fbdo.boolData()) {
      Firebase.RTDB.getString(&fbdo, "L5W1D/recording/timestamp");
      timeStamp = fbdo.stringData();

      ppg.clear();
      Signal.clear();

      // preparation
      for (i = 0; i < 300; i++) {
        sample = analogRead(32);
        Serial.println(sample);
        delay(10);
      }

      // recording
      Serial.println("recording...");
      pm = millis();
      for (i = 0; i < 1000; i++) {
        delay(10);
        sample = analogRead(32);
        Serial.print("recording... ");
        Serial.println(sample);
        Signal.add(sample);
      }
      ppg.set("elapsed-time", millis() - pm);

      Signal.toString(str_signal);

      ppg.set("signal", str_signal);
      ppg.set("timestamp", timeStamp);

      Firebase.RTDB.setBool(&fbdo, "L5W1D/recording/state", false);
      Firebase.RTDB.set(&fbdo, "L5W1D/ppg", &ppg);

      delay(2000);
    }
    sample = analogRead(32);
    Serial.println(sample);
    Firebase.RTDB.setInt(&fbdo, "L5W1D/sample", sample);
  }

  delay(500);
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
  } else
    Serial.printf("%s\n", config.signer.signupError.message.c_str());

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
}
