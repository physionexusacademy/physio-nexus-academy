"""Hair texture for the hair shell: the photo's hair pixels only (background wall and skin replaced by hair colour), cropped.
Projection: photo px = MID + x*S, EYE_PY + (EYE_Y - y)*S  (same fit coordinates as the face bake)."""
import numpy as np
from PIL import Image, ImageFilter
photo = np.asarray(Image.open('/home/user/physio-nexus-academy/reference/dr-sajjad-raza.png').convert('RGB'), np.float32) / 255
X0, Y0, X1, Y1 = 300, 100, 700, 460                         # crop (photo px)
crop = photo[Y0:Y1, X0:X1]
R, G, B = crop[..., 0], crop[..., 1], crop[..., 2]
lum = .299 * R + .587 * G + .114 * B
# hair = dark pixels; everything bright (wall, forehead) is "not hair"
yy, xx = np.mgrid[Y0:Y1, X0:X1]
warm = (B - R) < 0.05                                   # the navy wall panel is blue, hair is neutral/warm
region = ((yy < 355) | (xx < 405) | (xx > 640)) & ~((xx <= 394) & (yy >= 398)) & ~((xx >= 642) & (yy >= 396))     # not the brows, eyes or the ears
hair = ((lum < 0.30) & warm & region).astype(np.float32)
hair = np.asarray(Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
mean = (crop * hair[..., None]).sum((0, 1)) / hair.sum()
print('mean hair colour', (mean * 255).round(0))
fill = np.zeros_like(crop); fill[:] = mean * 0.8
out = crop * hair[..., None] + fill * (1 - hair[..., None])
# lift the darkest values slightly so the 3D shading can still show form
out = np.clip(out * 1.08 + 0.01, 0, 1)
im = Image.fromarray((out * 255).astype(np.uint8))
im.save('hair-preview.png')
im.save('/home/user/physio-nexus-academy/public/teacher/dr-sajjad-hair.webp', quality=82, method=6)
import os; print('hair webp', os.path.getsize('/home/user/physio-nexus-academy/public/teacher/dr-sajjad-hair.webp') // 1024, 'KB', im.size)
