/* Owned additive, nearest-neighbor, one-source-row-per-destination-row kernel.
 * Keep double precision and operation order aligned with the JS pixel path.
 * No fast-math, relaxed SIMD, FMA, libc, allocation, or imported functions. */
typedef unsigned char byte;

static byte rounded_byte(double value) {
  if (value >= 255.0) return 255;
  int whole = (int)value;
  /* Adding .5 before truncation rounds just-below-half doubles incorrectly. */
  return (byte)(whole + (value - whole >= .5));
}

void composite_add_rows(const byte *source, byte *destination,
                        const double *offsets, unsigned int width,
                        unsigned int height, unsigned int color, double alpha) {
  double tint[3] = {(color & 255) / 255.0,
                    ((color >> 8) & 255) / 255.0,
                    ((color >> 16) & 255) / 255.0};
  /* Cache exact independent subexpressions without reassociating arithmetic.
   * These small per-batch tables also avoid SIMD requirements on browsers. */
  double tinted[3][256], alphas[256], squared_alphas[256], normalized[256];
  for (unsigned int v = 0; v < 256; ++v) {
    normalized[v] = v / 255.0;
    alphas[v] = normalized[v] * alpha;
    squared_alphas[v] = alphas[v] * alphas[v];
    for (unsigned int c = 0; c < 3; ++c) tinted[c][v] = v * tint[c];
  }
  for (unsigned int y = 0; y < height; ++y) {
    double offset = offsets[y];
    double left = __builtin_ceil(offset - .5);
    double right = __builtin_ceil(offset + width - .5);
    if (left < 0) left = 0;
    if (right > width) right = width;
    if (left >= right) continue;
    unsigned int start = (unsigned int)left, end = (unsigned int)right;
    for (unsigned int x = start; x < end; ++x) {
      double sample = __builtin_floor(x + .5 - offset);
      if (sample < 0) sample = 0;
      if (sample > width - 1) sample = width - 1;
      unsigned int s = (y * width + (unsigned int)sample) * 4;
      unsigned int d = (y * width + x) * 4;
      double sa = alphas[source[s + 3]];
      for (unsigned int c = 0; c < 3; ++c) {
        destination[d + c] = rounded_byte(tinted[c][source[s + c]] * sa + destination[d + c]);
      }
      destination[d + 3] = rounded_byte(255.0 * (squared_alphas[source[s + 3]] + normalized[destination[d + 3]]));
    }
  }
}
