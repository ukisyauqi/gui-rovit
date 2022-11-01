#if defined(ESP32)
#include <WiFi.h>
#include <FirebaseESP32.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#endif
 
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
 
/* Masukan Nama Wifi dan Password*/
#define WIFI_SSID "uki"
#define WIFI_PASSWORD "ukiukiuki"
 
/* Masukan Web API Key */
#define API_KEY "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM"
 
/* Masukan Firebase Realtime Database URL */
#define DATABASE_URL "https://gui-rovit-default-rtdb.asia-southeast1.firebasedatabase.app/"
 
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
 
 bool signupOK = false;
unsigned long sendDataPrevMillis = 0;
const int openDrawerPin = 4;
const int closeDrawerPin = 5;
const int UVPin = 27

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  pinMode(openDrawerPin, OUTPUT);
  pinMode(closeDrawerPin, OUTPUT);
  pinMode(UVPin, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
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
    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("ok");
        signupOK = true;
    }
    else
        Serial.printf("%s\n", config.signer.signupError.message.c_str());
 
    config.token_status_callback = tokenStatusCallback;
 
    Firebase.begin(&config, &auth);
}

void loop() {
  if (signupOK && (millis() - sendDataPrevMillis > 500 || sendDataPrevMillis == 0))
    {
        sendDataPrevMillis = millis();
        Firebase.RTDB.getBool(&fbdo, "open");
        bool open = fbdo.boolData();
        Firebase.RTDB.getBool(&fbdo, "close");
        bool close = fbdo.boolData();
        Serial.println(open); 
        Serial.println(close); 
        if (open) {
          digitalWrite(openDrawerPin, HIGH);
          digitalWrite(closeDrawerPin, LOW);
          digitalWrite(UVPin, LOW);
        } else if (close) {
          digitalWrite(openDrawerPin, LOW);
          digitalWrite(closeDrawerPin, HIGH);
          digitalWrite(UVPin, HIGH);
        } else  {
          digitalWrite(openDrawerPin, LOW);
          digitalWrite(closeDrawerPin, LOW);
          digitalWrite(UVPin, LOW);
        }
    }
}
