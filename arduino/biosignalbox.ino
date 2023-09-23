#include "Wire.h"
#include <SparkFun_Bio_Sensor_Hub_Library.h>
#include <Adafruit_MLX90614.h>
#include <SimpleWebSerial.h>

#define TCAADDR 0x70
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
int resPin = 4;
int mfioPin = 5;
int width = 411;
int samples = 100;
int pulseWidthVal;
int sampleVal;
int a;
SparkFun_Bio_Sensor_Hub bioHub(resPin, mfioPin);
bioData body;
SimpleWebSerial WebSerial;

void tcaselect(uint8_t i)
{
  if (i > 7)
    return;
  Wire.beginTransmission(TCAADDR);
  Wire.write(1 << i);
  Wire.endTransmission();
}

void setup()
{
  while (!Serial);
  delay(1000);
  Wire.begin();
  Serial.begin(9600);
  tcaselect(0);
  int result = bioHub.begin();
  int error = bioHub.configSensorBpm(MODE_ONE); // Configure Sensor and BPM mode , MODE_TWO also available

  // Set pulse width.
  error = bioHub.setPulseWidth(width);

  // Check that the pulse width was set.
  pulseWidthVal = bioHub.readPulseWidth();

  error = bioHub.setSampleRate(samples);
  delay(1000);

  tcaselect(1);
  if (!mlx.begin())
  {
    while (1)
      ;
  };
  delay(2000);

  for (a = 0; a <= 40; a++)
  {
    WebSerial.send("temp", mlx.readObjectTempC());
    delay(250);
  }
  delay(1000);

}

void loop()
{
  tcaselect(0);
  WebSerial.check();
  body = bioHub.readBpm();

  char hr[5];
  char o2[5];

  // convert num to str
  sprintf(hr, "%d", body.heartRate);
  sprintf(o2, "%d", body.oxygen);

  WebSerial.send("hr", hr);
  WebSerial.send("o2", o2);

  delay(250);
}