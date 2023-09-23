#define pinA 13
#define pinDrawer1 12
#define pinDrawer2 14
#define pinTrig1 27
#define pinEcho1 26
//#define pinLm1 4
//#define pinLm2 5
#define pinUv 18

#if defined(ESP32)
#include <WiFi.h>
#include <FirebaseESP32.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#endif

#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

#define WIFI_SSID "angga"
#define WIFI_PASSWORD "12345678"

#define API_KEY "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM"
#define DATABASE_URL "https://gui-rovit-default-rtdb.asia-southeast1.firebasedatabase.app/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

// pm: prev millis
long pm, d1;
//bool lm1 = false;
//bool lm2 = false;
int state = 2;


void setup() {
  Serial.begin(9600);

  InitWifi();
  InitFirebase();

  pinMode(pinA, OUTPUT);
  pinMode(pinDrawer1, OUTPUT);
  pinMode(pinDrawer2, OUTPUT);
  pinMode(pinTrig1, OUTPUT);
  pinMode(pinEcho1, INPUT);
//  pinMode(pinLm1, INPUT);
//  pinMode(pinLm2, INPUT);
  pinMode(pinUv, OUTPUT);

  digitalWrite(pinA, HIGH);

}

void loop() {
  if (millis() - pm > 1000) {
    pm = millis();

    if (Firebase.ready()) {
      Firebase.RTDB.getInt(&fbdo, "upper-state");
      state = fbdo.intData();
    }

    if (state == 0) {  // diam, tutup
      Serial.print("tertutup\t");
      digitalWrite(pinDrawer1, LOW);
      digitalWrite(pinDrawer2, LOW);
      digitalWrite(pinUv, HIGH);
      Serial.print("uv_nyala\t");
    } else if (state == 1) {  // proses buka
      Serial.print("membuka\t");
      digitalWrite(pinDrawer1, LOW);
      digitalWrite(pinDrawer2, HIGH);
      digitalWrite(pinUv, LOW);
      Serial.print("uv_mati \t");
    } else if (state == 2) {  // buka diem
      Serial.print("terbuka\t");
      digitalWrite(pinDrawer1, LOW);
      digitalWrite(pinDrawer2, LOW);
      digitalWrite(pinUv, LOW);
      Serial.print("uv_mati \t");
    } else if (state == 3) {  // proses tutup
      Serial.print("menutup\t");
      digitalWrite(pinDrawer1, HIGH);
      digitalWrite(pinDrawer2, LOW);
      digitalWrite(pinUv, LOW);
      Serial.print("uv_mati \t");
    }

    d1 = getDistanceUltraSound(pinTrig1, pinEcho1);
    // d2 = getDistanceUltraSound(pinTrig2, pinEcho2);
    // d3 = getDistanceUltraSound(pinTrig3, pinEcho3);

//    lm1 = digitalRead(pinLm1);
//    lm2 = digitalRead(pinLm2);

//    if (!lm1) {  // lm yang tutup
//      digitalWrite(pinDrawer1, LOW);
//      digitalWrite(pinDrawer2, HIGH);
//      // delay(500);
//      // state = 2;
//    }
//    if (!lm2) {  // lm yang buka
//      digitalWrite(pinDrawer1, HIGH);
//      digitalWrite(pinDrawer2, LOW);
//      // delay(500);
//      // state = 0;
//    }
    if (checkAdaBenda()) {
      Serial.print("ada          \t");
    } else {
      Serial.print("tdk ada benda\t");
    }

    Serial.print("d:\t");
    Serial.print(d1);
    Serial.print("\t");
    Serial.print(state);
    Serial.print("\t");
//    Serial.print(lm1);
//    Serial.print(lm2);
    Serial.println("\t");
  }
}

long getDistanceUltraSound(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  return (pulseIn(echoPin, HIGH) / 2) / 29.1;
}

bool checkAdaBenda() {
  return (d1 < 30);  // && state = 2
}

void InitWifi() {
  /* Connect to Wifi*/
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
}

void InitFirebase() {

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