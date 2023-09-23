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
// #define WIFI_SSID "SFU-1"
// #define WIFI_PASSWORD "SFUnpad19"

#define API_KEY "AIzaSyDPAojc6krYTS0wsMUPxcScgnLQNS73hYY"
#define DATABASE_URL "https://bayu-88e4f-default-rtdb.asia-southeast1.firebasedatabase.app"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

#define pinSolenoid 5

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 3600;

int durasi, curr_h, curr_m, curr_s, start_h, start_m, start_s, end_h, end_m, end_s, start, curr, end;

String waktu_siram;

long prevMillis = 0;

bool signupOK;

void setup() {
  Serial.begin(115200);

  InitWifi();
  InitFirebase();

  // Init and get the time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  pinMode(pinSolenoid, OUTPUT);

  prevMillis = millis();
}

void loop() {

  if (millis() - prevMillis > 1000) {
    prevMillis = millis();

    if (Firebase.ready()) {
      Firebase.RTDB.getInt(&fbdo, "waktu-siram");
      waktu_siram = fbdo.stringData();
    }

    start_h = waktu_siram.substring(0, 2).toInt();
    start_m = waktu_siram.substring(3, 5).toInt();
    start_s = waktu_siram.substring(6, 8).toInt();
    end_h = waktu_siram.substring(9, 11).toInt();
    end_m = waktu_siram.substring(12, 14).toInt();
    end_s = waktu_siram.substring(15, 17).toInt();

    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
      Serial.println("Failed to obtain time");
      return;
    }
    char jamChr[3];
    char menitChr[3];
    char detikChr[3];
    strftime(jamChr, 3, "%H", &timeinfo);
    strftime(menitChr, 3, "%M", &timeinfo);
    strftime(detikChr, 3, "%S", &timeinfo);

    String jamStr = String(jamChr);
    String menitStr = String(menitChr);
    String detikStr = String(detikChr);

    curr_h = jamStr.toInt() + 7;
    curr_m = menitStr.toInt();
    curr_s = detikStr.toInt();

    start = start_h * 3600 + start_m * 60 + start_s;
    end = end_h * 3600 + end_m * 60 + end_s;
    curr = curr_h * 3600 + curr_m * 60 + curr_s;

    if (start <= curr && curr <= end) {
      digitalWrite(pinSolenoid, HIGH);
      Serial.print("menyiram...");
    } else {
      digitalWrite(pinSolenoid, LOW);
      Serial.print("stanby.....");
    }

    Serial.print(" waktu_siram: ");
    Serial.print(waktu_siram);
    Serial.print("  \t");
    Serial.print(curr_h);
    Serial.print(":");
    Serial.print(curr_m);
    Serial.print(":");
    Serial.print(curr_s);
    Serial.print("  \t");
    Serial.print(start);
    Serial.print("\t");
    Serial.print(curr);
    Serial.print("\t");
    Serial.print(end);
    Serial.println("\t");
  }
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
