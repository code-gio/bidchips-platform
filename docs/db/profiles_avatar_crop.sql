-- Avatar crop: store position and scale so the same crop can be applied when displaying.
-- Crop box size is fixed (e.g. 320px in the editor); image is displayed using these params.

alter table public.profiles
  add column if not exists avatar_crop_x double precision null,
  add column if not exists avatar_crop_y double precision null,
  add column if not exists avatar_crop_scale double precision null,
  add column if not exists avatar_crop_size integer null default 320,
  add column if not exists avatar_image_width integer null,
  add column if not exists avatar_image_height integer null;

comment on column public.profiles.avatar_crop_x is 'Crop area position X (pixels in 320px crop box)';
comment on column public.profiles.avatar_crop_y is 'Crop area position Y (pixels in 320px crop box)';
comment on column public.profiles.avatar_crop_scale is 'Image scale in crop editor';
comment on column public.profiles.avatar_crop_size is 'Crop box size used in editor (default 320)';
comment on column public.profiles.avatar_image_width is 'Natural width of the stored avatar image';
comment on column public.profiles.avatar_image_height is 'Natural height of the stored avatar image';
