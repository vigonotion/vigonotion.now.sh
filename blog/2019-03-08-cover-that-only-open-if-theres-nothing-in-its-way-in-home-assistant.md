---
title: Cover that only opens if there's nothing in it's way in Home Assistant
tags: [Home Assistant]
---

I have a screen that goes above my balcony door. If the door has been left open and I accidentally said "Alexa, turn on cinema mode" from downstairs, my screen probably wouldn't be as smooth anymore. I control my screen via Home Assistant, you can read more in another article [here](https://vigonotion.com/blog/building-a-smart-home-theater-with-home-assistant/). It's a cover, which can be opened, closed or stopped.

![Screen goes above my balcony door](/img/2019/03/vigoflix.jpg)

The plan is to create a [template_cover](https://www.home-assistant.io/components/cover.template/) that only opens the real cover if the balcony door is closed.

<!--truncate-->

## The Template Cover

In the configuration.yaml file, I first of all created a template cover:
```yaml
cover:
  - platform: template
    covers:
      my_screen_safe:
        friendly_name: "My Screen"
        value_template: "{{ states('cover.my_screen') }}"
        open_cover:
          service: script.open_my_screen_if_balcony_door_closed
        close_cover:
          service: cover.close_cover
          data:
            entity_id: cover.my_screen
        stop_cover:
          service: cover.stop_cover
          data:
            entity_id: cover.my_screen
```

The `value_template` is needed to show the state of the cover, which we can just copy from our real cover.

When we *open the cover*, a script is called, which I will go into more detail in the next step. If we *close* or *stop* the cover, I simply want the real cover to do exactly the same (the door can't be open if the screen is already down).

## Preventing Screen Damage

As you've seen above, when we *open the cover*, a script is called:

![script.open_my_screen_if_balcony_door_closed in the Home Assistant script editor](/img/2019/03/Screenshot_2019-03-08-Home-Assistant.png)

The script actions are called one by one. The first action is a condition, and the script stops if a condition isn't true. In my example, the script should stop if the balcony door is open, and otherwise *open the cover*.

```yaml
# the same script, but with yaml
script:
  open_my_screen_if_balcony_door_closed:
    alias: open cover.my_screen only if balcony door is closed
    sequence:
      - condition: state
        entity_id: binary_sensor.balcony_door
        state: 'off'
      - service: cover.open_cover
        data:
          entity_id: cover.my_cover
```

## Wrapping Up

Now the cover is finished! Make sure to only use `cover.my_screen_save` in your frontend, automations and cloud/emulated_hue components. That way, the cover really only opens if the door is closed.

Maybe your cover should only close when there is nothing in it's way, like the garage door and a light barrier checks the space? That's exactly the same, just put the script call to the *close_cover* action.

Are there any other covers you can think of that could take use of this? Share your ideas in the comment section below.

## TL;DR

1. Create a template_cover that mirrors all actions and the state from the original cover
2. Replace the *open_cover* action with a script that only opens the cover if the door is closed
