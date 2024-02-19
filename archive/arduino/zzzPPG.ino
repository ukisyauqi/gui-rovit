// 32
// SDA SCL | 21 22
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

#define USER_EMAIL "rovit@gmail.com"
#define USER_PASSWORD "Unpad57"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int i = 0;

int sample;

FirebaseJsonArray arr;

void setup() {
  Serial.begin(115200);
  setupWifiAndFirebase();
}

void loop() {
  if (Firebase.ready()) {
    Firebase.RTDB.getBool(&fbdo, "L5W1D/isRecording");

    if (fbdo.boolData()) {
      arr.clear();

      Serial.println("recording...");
      for (i = 0; i < 1300; i++) {
        delay(10);
        sample = analogRead(32);
        Serial.println(sample);
        arr.add(sample);
      }

      Firebase.RTDB.set(&fbdo, "L5W1D/isRecording", false);
      Firebase.RTDB.set(&fbdo, "L5W1D/signal", &arr);
    }
    Serial.println(analogRead(32));
    if (i != 0) {
      Firebase.RTDB.set(&fbdo, "L5W1D/sample", i);
      i = 0;
    } else {
      Firebase.RTDB.set(&fbdo, "L5W1D/sample", i);
      i = 1;
    }
  }
  delay(200);
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

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

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
