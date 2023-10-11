#include <WiFi.h>
#include <FirebaseESP32.h>

#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

#define WIFI_SSID "angga"
#define WIFI_PASSWORD "12345678"

#define API_KEY "AIzaSyB2njmJC2J5rTU9ecqkegcdfrXK2c1KVfM"
#define DATABASE_URL "https://gui-rovit-default-rtdb.asia-southeast1.firebasedatabase.app/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int A_ENA = 13;
int A_IN1 = 12;
int A_IN2 = 14;
int A_IN3 = 27;
int A_IN4 = 26;
int A_ENB = 25;
int B_ENA = 33;
int B_IN1 = 32;
int B_IN2 = 15;

int laciAtas;
int laciTengah;
int laciBawah;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  pinMode(A_ENA, OUTPUT);
  pinMode(A_IN1, OUTPUT);
	pinMode(A_IN2, OUTPUT);
  pinMode(A_ENB, OUTPUT);
  pinMode(A_IN3, OUTPUT);
	pinMode(A_IN4, OUTPUT);
  pinMode(B_ENA, OUTPUT);
  pinMode(B_IN1, OUTPUT);
	pinMode(B_IN2, OUTPUT);

  digitalWrite(A_IN1, LOW);
	digitalWrite(A_IN2, LOW);

  digitalWrite(A_IN3, LOW);
	digitalWrite(A_IN4, LOW);

  digitalWrite(B_IN1, LOW);
	digitalWrite(B_IN2, LOW);

	analogWrite(A_ENA, 255);
	analogWrite(A_ENB, 255);
	analogWrite(B_ENA, 255);

  InitWifi();
  InitFirebase();

}

void loop() {
  // put your main code here, to run repeatedly:
  if (Firebase.ready()) {
  Serial.print("... ");
    Firebase.RTDB.getJSON(&fbdo, "laci");
    FirebaseJson &json = fbdo.jsonObject();

    FirebaseJsonData result1;
    json.get(result1,"atas");
    laciAtas = result1.to<int>();

    FirebaseJsonData result2;
    json.get(result2,"tengah");
    laciTengah = result2.to<int>();

    FirebaseJsonData result3;
    json.get(result3,"bawah");
    laciBawah = result3.to<int>();

    // laciAtas = json.get(result,"atas");
    // laciTengah = json.get(result,"tengah");
    // laciBawah = json.get(result,"bawah");
    
    if (laciAtas == 0) diam(A_IN1, A_IN2);
    if (laciAtas == 1) buka(A_IN1, A_IN2);
    if (laciAtas == 2) tutup(A_IN1, A_IN2);

    if (laciTengah == 0) diam(A_IN3, A_IN4);
    if (laciTengah == 1) buka(A_IN3, A_IN4);
    if (laciTengah == 2) tutup(A_IN3, A_IN4);

    if (laciBawah == 0) diam(B_IN1, B_IN2);
    if (laciBawah == 1) buka(B_IN1, B_IN2);
    if (laciBawah == 2) tutup(B_IN1, B_IN2);
  }
  Serial.println("  ...");
}

void buka(int pin1, int pin2) {
  digitalWrite(pin1, HIGH);
	digitalWrite(pin2, LOW);
  Serial.print("  buka ");
  Serial.print(pin1);
  Serial.print(" ");
  Serial.print(pin2);
}
void tutup(int pin1, int pin2) {
  digitalWrite(pin1, LOW);
	digitalWrite(pin2, HIGH);
  Serial.print("  tutp ");
  Serial.print(pin1);
  Serial.print(" ");
  Serial.print(pin2);
}
void diam(int pin1, int pin2) {
  digitalWrite(pin1, LOW);
	digitalWrite(pin2, LOW);
  Serial.print("  diam ");
  Serial.print(pin1);
  Serial.print(" ");
  Serial.print(pin2);
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
  } else
    Serial.printf("%s\n", config.signer.signupError.message.c_str());

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
}

