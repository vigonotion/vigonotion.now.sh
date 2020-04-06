---
title: Monitor remaining water bottles with ESPHome and Home Assistant
tags: [esphome, Home Assistant]
---

After we ran out of sparkling water twice in a row, I decided to do something against that. The plan is to receive a notification when there are only three bottles left:

![Out of water! There are only 3 bottles of water left. You should get some new ones!](/img/2019/05/bottles1.png)

# Ideas

I need a way to sense how many bottles are left. Here are some ideas I had:

- putting a light sensor under each bottle in the box
- **put a scale under the crate**
- use a camera and a neural network to do some object detection

I don't know enough about neural networks and object detection, but I think this would be rather complicated and overpowered for what I want to achieve. It may be really hard to distinguish full bottles of water from empty ones, even I lift them slightly to check if they are full or empty. It could work for colored beverages though.

Using light sensors for each bottle is still an idea I want to check out in the future, as this solves the weight problem I'll go into in the next section.

<!--truncate-->

# Why weighting the bottles may not work for you

Before we begin weighting bottles, this approach probably only works for a few plastic bottles. I put a scale under the bottles and weight them (I normalized the result by substracting the weight of the crate). With the result, lets call it *W*, we can calculate the number of bottles like this:

![Equation](https://math.now.sh?from=n_%7Bfull%20bottles%7D%20%3D%20%5Clfloor%5Cfrac%7BW%7D%7B1070g%7D%5Crfloor)

Those brackets mean “round the result down”. I measured that one full bottle weights *1070g*, and one crate holds 12 bottles, so the maximum weight is *12840g*.

For my example, we will get the right result every time, because if all bottles are empty, the whole crate weights *70g × 12 = 840g* which is equal to zero bottles. Here is the problem: If you have glass bottles, and probably a crate of 24 bottles, this approach won't work for you. Let's assume an empty glass bottle weights *200g. *The drink itself weights *330g* for a *0,33l* bottle. Then, our formular would be:

![Equation](https://math.now.sh?from=n_%7Bfull%20bottles%7D%20%3D%20%5Clfloor%5Cfrac%7BW%7D%7B530g%7D%5Crfloor%0A)

For *W = 1795g*, this can either be 3 full and 1 empty bottle (1790g) or 9 empty bottles (1800g). As the scale doesn't return exact values and not every bottle weights the same, it is impossible to tell these cases apart. If you have an idea on how to solve this, please leave a comment below.

Now we learned that weighting the bottles will only work if:

![Equation](https://math.now.sh?from=W_%7Bempty%20bottle%7D%20%5Ctimes%20n_%7Bbottles%7D%20%5Clt%20W_%7Bfull%20bottle%7D)


# Put a scale under the crate

![wired scale](/img/2019/05/DSC_0899.JPG)

I decided to make the scale myself and use a cheap **HX711** module from a chinese supplier. Check out [this instructables](https://www.instructables.com/id/Arduino-Bathroom-Scale-With-50-Kg-Load-Cells-and-H/) to see how to wire them up.

I'll use ESPHome to program a WeMOS D1 Mini which is connected to the HX711.

:::info Source Code
You can find the latest source code for this project [here](/docs/esphome/water-bottles#code).
:::

The ESP sends the weight and the count to Home Assistant, where you only need to go to *Config > Integrations > ESPHome (Add)* and enter `water_bottles.local`. To get started with ESPHome, check out the [documentation](https://esphome.io/).

Now, you can add automations as desired. My automation reminds me to buy new water if there are less than 4 bottles left:

![Out of water! There are only 3 bottles of water left. Do you want me to add it to your shopping list? Button: Add water to my shopping list](/img/2019/05/bottles2.png)

Do you have an alternative idea to achieve this? Tell me in the comments.
