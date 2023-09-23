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
    Firebase.RTDB.getBool(&fbdo, "start-upper");
    start = fbdo.boolData();

    Serial.print("start ");
    Serial.println(start);

    if (start){
      buka();
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
  analogWrite(pinDrawer1, 0);
  analogWrite(pinDrawer2, 100);
  delay(4000);
  diam();
}

void diam(){
  Serial.println("diam");
  analogWrite(pinDrawer1, 0);
  analoglWrite(pinDrawer2, 0);
}

void tutup(){
  Serial.println("tutup");
  analogWrite(pinDrawer1, 100);
  analogWrite(pinDrawer2, 0);
  delay(4000);
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