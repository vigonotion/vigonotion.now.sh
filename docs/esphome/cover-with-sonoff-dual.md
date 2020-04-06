---
id: cover-with-sonoff-dual
title: Cover with Sonoff Dual

---

## About this project

I decided to buy a screen, motorized of course to integrate it into my smart home. I've chosen [this one](https://www.amazon.de/gp/product/B00X445AQI/ref=oh_aui_detailpage_o03_s00?ie=UTF8&amp;psc=1). The controller board was not smart, so I replaced it with a Sonoff Dual.

## Build instructions

I wrote a blog post about this a while ago. You can find it [here](/blog/2018/11/15/building-a-smart-home-theater-with-home-assistant).

## Code

```yaml
esphome:
  name: tom_leinwand
  platform: ESP8266
  board: esp01_1m
  board_flash_mode: dout

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

# Enable logging
logger:

# Enable Home Assistant API
api:

ota:

binary_sensor:
    # This is the button on the Sonoff Dual. I don't actually use it, but
    # in case Home Assistant is down, you could operate the cover manually.
  - platform: gpio
    pin:
      number: 10
      inverted: true
    id: button
    on_press:
      then:
        # logic for cycling through movements: open->stop->close->stop->...
        - lambda: |
            if (id(cover).state == cover::COVER_OPEN) {
              if (id(open).value){
                // cover is in opening movement, stop it
                id(cover).stop();
              } else {
                // cover has finished opening, close it
                id(cover).close();
              }
            } else if (id(cover).state == cover::COVER_CLOSED) {
              if (id(close).value){
                // cover is in closing movement, stop it
                id(cover).stop();
              } else {
                // cover has finished closing, open it
                id(cover).open();
              }
            } else {
              // state of cover is not known
              if (id(open).value || id(close).value){
                // cover is either opening or closing, stop it
                id(cover).stop();
              } else {
                id(cover).open();
              }
            }

switch:
  - platform: gpio
    pin: 5
    id: open
  - platform: gpio
    pin: 12
    id: close

cover:
  - platform: template
    name: "My Screen"
    id: cover
    open_action:
      # cancel potential previous movement
      - switch.turn_off:
          id: close
      # perform movement
      - switch.turn_on:
          id: open
      # wait until cover is open
      - delay: 29.5s
      # turn of relay to prevent keeping the motor powered
      - switch.turn_off:
          id: open
    close_action:
      - switch.turn_off:
          id: open
      - switch.turn_on:
          id: close
      - delay: 30s
      - switch.turn_off:
          id: close
    stop_action:
      - switch.turn_off:
          id: open
      - switch.turn_off:
          id: close
    optimistic: true
```