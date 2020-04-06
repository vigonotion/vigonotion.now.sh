---
title: Alexa connected to an audio receiver (with Home Assistant)
tags: [Home Assistant, Node-RED, Alexa, Multiroom Audio]
---

Shouldn't be a problem, right? Just connect your Echo device via AUX to the receiver, and voilá. But there *is* a problem: The receiver has to be on in order to hear Alexa's responses or music.

I want to hear my music through my "good" speakers, and when they are off, I want Alexa to answer me through the "okay" speakers of my Echo Show.

<!--truncate-->

# The Simple Solution

There is one rather simple solution: ditch the current receiver, and buy a Amazon Echo Link Amp. This is a receiver made by Amazon, and Alexa can play music on it. It has some inputs and outputs, and should work just fine. But there is a catch: You can only connect speakers with 60W max, my speakers need 100W. And your speakers may need even more. Also, this costs around $300.

![Echo Link Amp (about $300 on Amazon)](/img/2019/07/echoamp.jpg)

# My Over-Engineered Version

So here is the idea: If you put two Alexa's in a group, you can choose which one is the preferred device to play music. In my case, this will be the Amazon Echo Input, which is connected to the receiver. You can also use an Amazon Echo Link for better quality, but my ears can't tell the difference. 

![Screenshot of the Alexa App: Select Preferred Speaker](/img/2019/07/alexa_group_preferredspeaker.jpg)

The thing missing here is that the receiver does not turn on automatically. If your receiver has the ability to detect input on a source and turn on automatically, you are finished here. If not, stay tuned.

You'll need:

- A receiver that can be turned on with Home Assistant (I have a network receiver, but you could use a Logitech Harmony to turn it on too)
- A master Echo device with speaker, I would recommend getting an Echo Dot 3rd Gen. I'll use my Amazon Echo Show.
- An Amazon Echo Input
- Home Assistant and Node-RED (you can achieve the same using HA Automations, but I'll use Node-RED here)
- Some way of getting the media state of your Alexas. I'll use Keaton Taylor's custom component [Alexa Media Player](https://github.com/custom-components/alexa_media_player) for this.

## Automation #1: Turn the receiver on when music is played

When the Echo Input's state changes to *playing*, I want my receiver to turn on and change to the source *line3:*

![Node-RED flow for Automation #1](/img/2019/07/grafik.png)

 I also have an additional node that confirms that the receiver is on. This just prevents my network receiver from trying to turn on again, you may not need that step.

## Automation #2: Automatically turn the receiver off

Again, you may not need this step. My receiver turns off automatically after 8hrs, but I want my receiver to turn off immediately:

![Node-RED flow for Automation #2](/img/2019/07/grafik-1.png)

When the Echo Input's state *is not* playing, I'll wait for 10s just in case I started the music again, check if the receiver is on line3 and then turn it off. I check that because if I changed the source to line1 or tuner, I do not want my receiver to turn off.

## Automation #3: Stop music when changing the source on the Receiver or turning it off

This is really a quality of life automation. Let's say you're hearing a podcast via Alexa (your Amazon Echo Input) and then change the source to tuner. The podcast will continue to play and you'll lose track on where you were when you want to continue. So, I'll pause the music/podcast when changing the source of my receiver or if I turn it off manually:

![Node-RED flow for Automation #3](/img/2019/07/grafik-4.png)

# TL;DR

I was shopping the Echo Input on Prime Day for 15 USD. I hoped that the Echo Link got discounted, but it wasn't, so I had to come up with a different solution, this solution. It also saved me 185 USD.

This exact setup will most likely not work for you, but the general idea might help you.

# Source Code

```js
[{"id":"7dd9b949.241c5","type":"server-state-changed","z":"888ff54.01d0f08","name":"Echo Input is playing","server":"e02cc9b7.16ead8","entityidfilter":"media_player.echo_input","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"playing","halt_if_type":"str","halt_if_compare":"is","outputs":2,"output_only_on_state_change":false,"x":130,"y":120,"wires":[[],["94457b00.b5f5a8"]]},{"id":"cac76f36.abacc8","type":"api-call-service","z":"888ff54.01d0f08","name":"Select line3","server":"e02cc9b7.16ead8","service_domain":"media_player","service":"select_source","data":"{\"entity_id\":\"media_player.receiver\",\"source\":\"line3\"}","mergecontext":"","output_location":"","output_location_type":"none","x":810,"y":120,"wires":[[]]},{"id":"1f5384a.3c845fb","type":"api-call-service","z":"888ff54.01d0f08","name":"Turn Receiver on","server":"e02cc9b7.16ead8","service_domain":"media_player","service":"turn_on","data":"{\"entity_id\":\"media_player.receiver\"}","mergecontext":"","output_location":"","output_location_type":"none","x":590,"y":140,"wires":[["cac76f36.abacc8"]]},{"id":"94457b00.b5f5a8","type":"api-current-state","z":"888ff54.01d0f08","name":"Receiver off?","server":"e02cc9b7.16ead8","outputs":2,"halt_if":"on","halt_if_type":"str","halt_if_compare":"is_not","override_topic":false,"entity_id":"media_player.receiver","state_type":"str","state_location":"payload","override_payload":"msg","entity_location":"data","override_data":"msg","x":350,"y":120,"wires":[["cac76f36.abacc8"],["1f5384a.3c845fb"]]},{"id":"3319a04c.f8f148","type":"delay","z":"888ff54.01d0f08","name":"wait 10s","pauseType":"delay","timeout":"10","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":380,"y":320,"wires":[["1e87331c.1e694d"]]},{"id":"1e87331c.1e694d","type":"api-current-state","z":"888ff54.01d0f08","name":"Receiver Status","server":"e02cc9b7.16ead8","outputs":2,"halt_if":"on","halt_if_type":"str","halt_if_compare":"is","override_topic":false,"entity_id":"media_player.receiver","state_type":"str","state_location":"payload","override_payload":"msg","entity_location":"data","override_data":"msg","x":540,"y":320,"wires":[[],["6ac7f480.586a24"]]},{"id":"75c8a22.3019a5c","type":"server-state-changed","z":"888ff54.01d0f08","name":"Echo paused/stopped","server":"e02cc9b7.16ead8","entityidfilter":"media_player.echo_input","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"playing","halt_if_type":"str","halt_if_compare":"is_not","outputs":2,"output_only_on_state_change":false,"x":140,"y":320,"wires":[["64609d5f.913ab4"],["3319a04c.f8f148"]]},{"id":"6ac7f480.586a24","type":"switch","z":"888ff54.01d0f08","name":"Receiver still on line3?","property":"data.attributes.source","propertyType":"msg","rules":[{"t":"eq","v":"line3","vt":"str"}],"checkall":"true","repair":false,"outputs":1,"x":740,"y":320,"wires":[["74e0ae1c.5a5738"]]},{"id":"74e0ae1c.5a5738","type":"api-call-service","z":"888ff54.01d0f08","name":"Turn off Receiver","server":"e02cc9b7.16ead8","service_domain":"media_player","service":"turn_off","data":"{\"entity_id\":\"media_player.receiver\"}","mergecontext":"","output_location":"","output_location_type":"none","x":950,"y":320,"wires":[[]]},{"id":"4735063e.92f4e","type":"server-state-changed","z":"888ff54.01d0f08","name":"Receiver state changed","server":"e02cc9b7.16ead8","entityidfilter":"media_player.tom_main","entityidfiltertype":"exact","outputinitially":false,"state_type":"str","haltifstate":"on","halt_if_type":"str","halt_if_compare":"is","outputs":2,"output_only_on_state_change":false,"x":140,"y":540,"wires":[[],["9bf399f4.3eb14"]]},{"id":"4298fe9c.05a8e8","type":"switch","z":"888ff54.01d0f08","name":"Source changed?","property":"data.attributes.source","propertyType":"msg","rules":[{"t":"neq","v":"line3","vt":"str"}],"checkall":"true","repair":false,"outputs":1,"x":630,"y":580,"wires":[["5d869074.32b66"]]},{"id":"5d869074.32b66","type":"api-call-service","z":"888ff54.01d0f08","name":"pause music on echo input","server":"e02cc9b7.16ead8","service_domain":"media_player","service":"media_pause","data":"{\"entity_id\":\"media_player.echo_input\"}","mergecontext":"","output_location":"","output_location_type":"none","x":860,"y":560,"wires":[[]]},{"id":"64609d5f.913ab4","type":"change","z":"888ff54.01d0f08","name":"reset if playing again","rules":[{"t":"set","p":"reset","pt":"msg","to":"1","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":300,"y":260,"wires":[["3319a04c.f8f148"]]},{"id":"50b7e819.473768","type":"api-current-state","z":"888ff54.01d0f08","name":"Receiver Status","server":"e02cc9b7.16ead8","outputs":2,"halt_if":"on","halt_if_type":"str","halt_if_compare":"is","override_topic":false,"entity_id":"media_player.receiver","state_type":"str","state_location":"payload","override_payload":"msg","entity_location":"data","override_data":"msg","x":440,"y":560,"wires":[["5d869074.32b66"],["4298fe9c.05a8e8"]]},{"id":"9bf399f4.3eb14","type":"delay","z":"888ff54.01d0f08","name":"wait 10s","pauseType":"delay","timeout":"10","timeoutUnits":"seconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":340,"y":500,"wires":[["50b7e819.473768"]]},{"id":"e02cc9b7.16ead8","type":"server","z":"","name":"Home Assistant"}]
```