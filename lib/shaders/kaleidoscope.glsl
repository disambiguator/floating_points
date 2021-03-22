    const float PI = 3.14159265359;

    vec2 smallKoleidoscope(vec2 uv, float numSides) {
        float KA = PI / numSides;
        // get the angle in radians of the current coords relative to origin (i.e. center of screen)
        float angle = atan (uv.y, uv.x);
        // repeat image over evenly divided rotations around the center
        angle = mod (angle, 2.0 * KA);
        // reflect the image within each subdivision to create a tilelable appearance
        angle = abs (angle - KA);
        // rotate image over time
        // angle += 0.1*time;
        // get the distance of the coords from the uv origin (i.e. center of the screen)
        float d = length(uv);
        // map the calculated angle to the uv coordinate system at the given distance
        return d * vec2(cos(angle), sin(angle));
    }

    vec2 reflectImage(vec2 i) {
      return mod(i,1.)*-(step(1.,i)*2.-1.) + step(1.0,i);
    }

    vec2 kaleidoscope(vec2 position, float numSides) {
      return numSides > 0. ? reflectImage(smallKoleidoscope(position, numSides)) : position;
    }

    #pragma glslify: export(kaleidoscope)
