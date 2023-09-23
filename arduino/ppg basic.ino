int PulseSensorPurplePin = 15;

int Signal;

void setup() {
  Serial.begin(9600);
}

void loop() {
  Signal = analogRead(PulseSensorPurplePin);  
  Serial.println(Signal);                    
  delay(10);
}
