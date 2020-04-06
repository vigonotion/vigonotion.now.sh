---
id: water-bottles
title: Water Bottles

---

## About this project

After we ran out of sparkling water twice in a row, I built a WiFi-connected scale that measures the amount of bottles based on the weight.

## Build instructions

I wrote a blog post about this a while ago. You can find it [here](/blog/2019/05/07/monitor-remainding-water-bottles).

## Code

```yaml
esphome:
  name: water_bottles
  platform: ESP8266
  board: d1_mini


wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  power_save_mode: none

  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: "Water Bottles"
    password: !secret ap_fallback_password

captive_portal:

api:
ota:
logger:

sensor:

    # Here we create a new sensor for the HX711 load cell amp.
  - platform: hx711
    name: "water_bottles_weight"
    id: water_bottles_weight
    dout_pin: D2
    clk_pin: D1
    gain: 128
    update_interval: 60s            # Defines how often the weight is sent to Home Assistant
    filters:                        # We need to measure twice: once with 0g and once with
      - calibrate_linear:           # another known mass (12840g) and map these values to the
          - 18595 -> 0              # readouts of the HX711 (see the logs and remove the filters: section)
          - -296403 -> 12840
    unit_of_measurement: g

    # Create a new template sensor for the bottle count
  - platform: template
    name: "water_bottles_count"

    # Get the weight and divide it by 1000 (because each bottle weights 1000g)
    # We only return values >= 0, because obviously there can't be -1 bottles.
    lambda: |-
      auto n = floor(id(water_bottles_weight).state / 1000);
      if (n > 0) return n;
      return 0;
    update_interval: 60s
    accuracy_decimals: 0

    # Uptime sensor
  - platform: uptime
    name: Water Bottles Uptime

    # WiFi Signal sensor
  - platform: wifi_signal
    name: Water Bottles WiFi Signal
    update_interval: 60s

switch:
  # Switch to restart the node
  - platform: restart
    name: Water Bottles Restart
```