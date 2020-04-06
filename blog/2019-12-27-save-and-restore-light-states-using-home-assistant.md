---
title: Save and restore light states using Home Assistant
tags: [Home Assistant, Node-RED]
---

Sometimes I leave a room for a short amount of time, like for eating dinner. After dinner, I want to come back into that room and continue with whatever I was doing. I don't want to leave my lights and my radio on all the time, so I turn them off whenever I leave. When I come back, I have to turn everything back on to the configuration I had before manually (like only turning on the reading lamp or putting the desk lamp to cold white for concentration). Using Home Assistant, I can now save the configuration of my lights and my radio, and restore them when I come back into my room.

<!--truncate-->

This is done using scenes. In Home Assistant, you can define scenes to control lights or any other entity to transition into a predefined state. I have four scenes in my room: Afternoon, Night, Concentration and Reading. I created them using the [scene editor](https://www.home-assistant.io/docs/scene/editor/) (Configuration > Scenes), but you can also create them using a service.

I have a double rocker switch next to my door, and pressing the right button means "save the state" and the left button "restores the state". To save a scene, you have to call **scene.create** with this data:

    scene_id: snapshot_livingroom
    snapshot_entities:
    - light.ceiling
    - light.ambient_right
    - light.ambient_left
    - light.led_strip
    - media_player.radio

In the snapshot_entities, you can say which entities will be saved for this scene. This will probably be all entities you normally control manually in the room. You can [read the documentation here](https://www.home-assistant.io/integrations/scene/#applying-a-scene-without-defining-it).

I'm just calling this service using an automation. For the left button, which restores the scene, I just call the service to turn on a scene: **scene.turn_on**. The data will be:

    entity_id: scene.snapshot_livingroom

I use Node-RED for my automations, but this is very simple to do in the Home Assistant automation editor as well. You can check out the flow [here](https://gist.github.com/vigonotion/2e0a7e3537bf150f99681b5b4f2f3339).

This is not limited to lights. I'm also restoring whether my radio was playing (including the volume), and you can even include covers, switches or everything else in Home Assistant that supports scenes.

# TL;DR

- use **scene.create** to save a scene (specify snapshot_entities)
- use **scene.turn_on** to restore the scene
- use automations to call the two services, e. g. using a double rocker switch or motion sensors
