#include <Arduino.h>
#include <Wire.h>
#include <HX711.h>
#include <TM1637Display.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>

// =====================================================
// PIN DEFINITIONS
// =====================================================

// HX711
#define HX711_DT   5
#define HX711_SCK  18

// TM1637 4-digit display
#define TM_CLK     19
#define TM_DIO     23

// LEDs
#define RED_LED    32
#define GREEN_LED  33

// Buzzer
#define BUZZER     27

// Buttons
#define YELLOW_BTN 26
#define RED_BTN    2

// =====================================================
// OBJECTS
// =====================================================

HX711 scale;

TM1637Display display(TM_CLK, TM_DIO);

LiquidCrystal_I2C lcd(0x27, 16, 2);

RTC_DS1307 rtc;

// =====================================================
// HX711 CALIBRATION
// =====================================================

// Change this value if the displayed weight is incorrect.
float calibration_factor = 420.0;

// =====================================================
// SYSTEM VARIABLES
// =====================================================

bool alternateMode = false;
bool tamperLocked = false;

bool rtcAvailable = false;

// =====================================================
// BUTTON VARIABLES
// =====================================================

bool lastYellowState = HIGH;
bool lastRedState = HIGH;

unsigned long lastYellowTime = 0;
unsigned long lastRedTime = 0;

const unsigned long debounceDelay = 200;

// =====================================================
// HX711 VARIABLES
// =====================================================

unsigned long lastHX711Check = 0;
bool hx711Available = false;

// =====================================================
// SETUP
// =====================================================

void setup()
{
  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println("==============================");
  Serial.println(" SMART WEIGHING SYSTEM");
  Serial.println("==============================");

  // ---------------------------------------------------
  // GPIO
  // ---------------------------------------------------

  pinMode(YELLOW_BTN, INPUT_PULLUP);
  pinMode(RED_BTN, INPUT_PULLUP);

  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  pinMode(BUZZER, OUTPUT);

  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(BUZZER, LOW);

  // ---------------------------------------------------
  // I2C
  // ---------------------------------------------------

  Wire.begin(21, 22);

  // ---------------------------------------------------
  // LCD
  // ---------------------------------------------------

  lcd.init();
  lcd.backlight();
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("SMART WEIGHING");

  lcd.setCursor(0, 1);
  lcd.print("Starting...");

  // ---------------------------------------------------
  // TM1637
  // ---------------------------------------------------

  display.setBrightness(7);
  display.clear();

  delay(1000);

  // ---------------------------------------------------
  // HX711
  // ---------------------------------------------------

  Serial.println("Starting HX711...");

  scale.begin(HX711_DT, HX711_SCK);

  delay(500);

  if (scale.is_ready())
  {
    Serial.println("HX711 FOUND!");

    hx711Available = true;

    scale.set_scale(calibration_factor);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("HX711 FOUND");

    lcd.setCursor(0, 1);
    lcd.print("Taring...");

    delay(1000);

    scale.tare();

    Serial.println("HX711 TARE COMPLETE");
  }
  else
  {
    Serial.println("HX711 NOT READY");

    hx711Available = false;

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("HX711 WAITING");

    lcd.setCursor(0, 1);
    lcd.print("Checking...");

    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);
  }

  // ---------------------------------------------------
  // RTC DS1307
  // ---------------------------------------------------

  Serial.println("Checking RTC...");

  if (rtc.begin())
  {
    Serial.println("RTC FOUND");

    rtcAvailable = true;

    if (!rtc.isrunning())
    {
      Serial.println("RTC was stopped.");
      Serial.println("Setting RTC time...");

      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
  }
  else
  {
    Serial.println("RTC NOT FOUND");

    rtcAvailable = false;
  }

  // ---------------------------------------------------
  // START SYSTEM
  // ---------------------------------------------------

  lcd.clear();

  if (hx711Available)
  {
    lcd.setCursor(0, 0);
    lcd.print("SYSTEM READY");

    lcd.setCursor(0, 1);
    lcd.print("NORMAL MODE");

    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
  }
  else
  {
    lcd.setCursor(0, 0);
    lcd.print("HX711 ERROR");

    lcd.setCursor(0, 1);
    lcd.print("CHECK SENSOR");

    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);
  }

  delay(1500);

  lcd.clear();

  Serial.println("==============================");
  Serial.println("SYSTEM STARTED");
  Serial.println("==============================");
}

// =====================================================
// BEEP
// =====================================================

void beep()
{
  digitalWrite(BUZZER, HIGH);
  delay(120);
  digitalWrite(BUZZER, LOW);
}

// =====================================================
// TAMPER ALARM
// =====================================================

void tamperAlarm()
{
  for (int i = 0; i < 3; i++)
  {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(BUZZER, HIGH);

    delay(200);

    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW);

    delay(150);
  }

  digitalWrite(RED_LED, HIGH);
}

// =====================================================
// CHECK YELLOW BUTTON
// =====================================================

void checkYellowButton()
{
  bool yellowState = digitalRead(YELLOW_BTN);

  if (lastYellowState == HIGH &&
      yellowState == LOW &&
      millis() - lastYellowTime > debounceDelay)
  {
    lastYellowTime = millis();

    if (tamperLocked)
    {
      return;
    }

    alternateMode = !alternateMode;

    beep();

    if (alternateMode)
    {
      Serial.println("ALTERNATE MODE");

      lcd.clear();

      lcd.setCursor(0, 0);
      lcd.print("ALTERNATE MODE");

      lcd.setCursor(0, 1);
      lcd.print("READING +20%");

      digitalWrite(GREEN_LED, LOW);
      digitalWrite(RED_LED, HIGH);
    }
    else
    {
      Serial.println("NORMAL MODE");

      lcd.clear();

      lcd.setCursor(0, 0);
      lcd.print("NORMAL MODE");

      lcd.setCursor(0, 1);
      lcd.print("NORMAL READING");

      digitalWrite(RED_LED, LOW);
      digitalWrite(GREEN_LED, HIGH);
    }

    delay(700);

    lcd.clear();
  }

  lastYellowState = yellowState;
}

// =====================================================
// CHECK RED BUTTON
// =====================================================

void checkRedButton()
{
  bool redState = digitalRead(RED_BTN);

  if (lastRedState == HIGH &&
      redState == LOW &&
      millis() - lastRedTime > debounceDelay)
  {
    lastRedTime = millis();

    tamperLocked = true;
    alternateMode = false;

    Serial.println();
    Serial.println("==============================");
    Serial.println("!!! TAMPERING DETECTED !!!");
    Serial.println("MACHINE LOCKED");
    Serial.println("==============================");

    digitalWrite(GREEN_LED, LOW);

    tamperAlarm();

    lcd.clear();

    lcd.setCursor(0, 0);
    lcd.print("TAMPERING!");

    lcd.setCursor(0, 1);
    lcd.print("MACHINE LOCK");

    display.clear();
  }

  lastRedState = redState;
}

// =====================================================
// SHOW TAMPER LOCK
// =====================================================

void showTamperLock()
{
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, HIGH);

  uint8_t segments[] =
  {
    SEG_G,
    SEG_G,
    SEG_G,
    SEG_G
  };

  display.setSegments(segments);

  static unsigned long lastAlarm = 0;

  if (millis() - lastAlarm >= 2000)
  {
    lastAlarm = millis();

    digitalWrite(BUZZER, HIGH);
    delay(100);
    digitalWrite(BUZZER, LOW);
  }
}

// =====================================================
// CHECK HX711
// =====================================================

void checkHX711()
{
  if (millis() - lastHX711Check < 1000)
  {
    return;
  }

  lastHX711Check = millis();

  if (scale.is_ready())
  {
    if (!hx711Available)
    {
      Serial.println("HX711 FOUND AGAIN!");

      scale.set_scale(calibration_factor);
      scale.tare();

      hx711Available = true;

      lcd.clear();

      lcd.setCursor(0, 0);
      lcd.print("HX711 READY");

      lcd.setCursor(0, 1);
      lcd.print("NORMAL MODE");

      digitalWrite(RED_LED, LOW);
      digitalWrite(GREEN_LED, HIGH);

      delay(500);
      lcd.clear();
    }
  }
  else
  {
    if (hx711Available)
    {
      Serial.println("HX711 LOST!");

      hx711Available = false;

      digitalWrite(GREEN_LED, LOW);
      digitalWrite(RED_LED, HIGH);
    }
  }
}

// =====================================================
// SHOW WEIGHT ON TM1637
// =====================================================

void showWeightOn7Segment(float weight)
{
  if (weight < 0)
  {
    weight = 0;
  }

  if (weight >= 1000.0)
  {
    int value = (int)weight;

    if (value > 9999)
    {
      value = 9999;
    }

    display.showNumberDec(value, false);
  }
  else if (weight >= 100.0)
  {
    int value = (int)(weight * 10.0);

    display.showNumberDecEx(
      value,
      0b01000000,
      false
    );
  }
  else if (weight >= 10.0)
  {
    int value = (int)(weight * 10.0);

    display.showNumberDecEx(
      value,
      0b01000000,
      false
    );
  }
  else
  {
    int value = (int)(weight * 100.0);

    if (value > 999)
    {
      value = 999;
    }

    display.showNumberDecEx(
      value,
      0b00000100,
      true
    );
  }
}

// =====================================================
// SHOW HX711 ERROR
// =====================================================

void showHX711Error()
{
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, HIGH);

  display.showNumberDec(0, false);

  lcd.setCursor(0, 0);
  lcd.print("HX711 ERROR     ");

  lcd.setCursor(0, 1);
  lcd.print("CHECK SENSOR    ");
}

// =====================================================
// LOOP
// =====================================================

void loop()
{
  // BUTTONS
  checkYellowButton();
  checkRedButton();

  // TAMPER LOCK
  if (tamperLocked)
  {
    showTamperLock();
    delay(50);
    return;
  }

  // CHECK HX711
  checkHX711();

  if (!hx711Available)
  {
    showHX711Error();
    delay(200);
    return;
  }

  // READ WEIGHT
  float actualWeight = scale.get_units(5);

  if (actualWeight < 0)
  {
    actualWeight = 0;
  }

  if (actualWeight < 0.5)
  {
    actualWeight = 0;
  }

  // ALTERNATE MODE (+20% TAMPERING SIMULATION)
  float displayedWeight;

  if (alternateMode)
  {
    displayedWeight = actualWeight * 1.20;
  }
  else
  {
    displayedWeight = actualWeight;
  }

  // 7 SEGMENT
  showWeightOn7Segment(displayedWeight);

  // RTC
  DateTime now;

  if (rtcAvailable)
  {
    now = rtc.now();
  }

  // LCD LINE 1
  lcd.setCursor(0, 0);

  if (alternateMode)
  {
    lcd.print("ALTER:");
  }
  else
  {
    lcd.print("Weight:");
  }

  lcd.print("        ");

  lcd.setCursor(8, 0);

  if (displayedWeight < 1000)
  {
    lcd.print(displayedWeight, 1);
  }
  else
  {
    lcd.print((int)displayedWeight);
  }

  lcd.print("kg");

  // LCD LINE 2 - TIME
  lcd.setCursor(0, 1);

  if (rtcAvailable)
  {
    if (now.hour() < 10)
      lcd.print("0");

    lcd.print(now.hour());

    lcd.print(":");

    if (now.minute() < 10)
      lcd.print("0");

    lcd.print(now.minute());

    lcd.print(":");

    if (now.second() < 10)
      lcd.print("0");

    lcd.print(now.second());
  }
  else
  {
    lcd.print("RTC ERROR");
  }

  // STATUS
  if (alternateMode)
  {
    lcd.setCursor(11, 1);
    lcd.print("ALT ");
  }
  else
  {
    lcd.setCursor(11, 1);
    lcd.print("OK  ");
  }

  // LED STATUS
  if (alternateMode)
  {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);
  }
  else
  {
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
  }

  // SERIAL MONITOR
  Serial.print("Actual Weight: ");
  Serial.print(actualWeight, 2);

  Serial.print(" kg | Displayed: ");
  Serial.print(displayedWeight, 2);

  Serial.print(" kg | Mode: ");

  if (alternateMode)
  {
    Serial.println("ALTERNATE");
  }
  else
  {
    Serial.println("NORMAL");
  }

  delay(300);
}
