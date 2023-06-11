#define pinA 13
#define pinDrawer1 12
#define pinDrawer2 14
#define trigPin 27
#define echoPin 26


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

int state = 2;

bool start = false;


void setup() {
  Serial.begin(9600);

  InitWifi();
  InitFirebase();

  pinMode(pinA, OUTPUT);
  pinMode(pinDrawer1, OUTPUT);
  pinMode(pinDrawer2, OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  digitalWrite(pinA, HIGH);
}

void loop() {
  if (Firebase.ready()) {
    Firebase.RTDB.getBool(&fbdo, "start-lower");
    start = fbdo.boolData();

    Serial.print("start ");
    Serial.println(start);

    if (start){
      buka();

      int jarak = 1;


      while (jarak < 10){
        diam();
        jarak = getDistanceUltraSound();
        Serial.print("jarak ");
        Serial.println(jarak);
        delay(100);
      }

      delay(2000);
      tutup();

      // benda kosong, jarak => 10
      // ada benda, jarak < 10

      delay(1000);
      Firebase.RTDB.set(&fbdo, "start-lower", false);
    }
  }
}

int getDistanceUltraSound() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  return (pulseIn(echoPin, HIGH) / 2) / 29.1;
}

void buka(){
  Serial.println("buka");
  digitalWrite(pinDrawer1, LOW);
  digitalWrite(pinDrawer2, HIGH);
  delay(2000);
  diam();
}

void diam(){
  Serial.println("diam");
  digitalWrite(pinDrawer1, LOW);
  digitalWrite(pinDrawer2, LOW);
}

void tutup(){
  Serial.println("tutup");
  digitalWrite(pinDrawer1, HIGH);
  digitalWrite(pinDrawer2, LOW);
  delay(2000);
  diam();
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