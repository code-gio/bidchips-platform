# Configuración: Storage (avatar) y migraciones

## 1. Bucket de avatares (Storage)

Si al subir la foto de perfil ves **"bucket not found"** o la imagen no carga (400), el bucket `avatars` no existe en Supabase.

### En el Dashboard de Supabase

1. Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Menú izquierdo → **Storage**.
3. **New bucket**.
4. **Name:** `avatars`
5. **Public bucket:** **On** (para que las URLs de avatar funcionen en `<img>`).
6. **Create bucket**.

Si usas políticas RLS en Storage, añade al menos una política de lectura pública para que las imágenes se puedan ver:

```sql
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');
```

(Ejecuta esto en **SQL Editor** de Supabase.)

---

## 2. Migraciones de perfil (tagline, bio, etc.)

Si **tagline**, **bio** o la **fecha de nacimiento** no se guardan, es porque en la tabla `profiles` faltan esas columnas.

Ejecuta en **SQL Editor** de Supabase el contenido de:

- `docs/db/profiles_onboarding_extra.sql`

O directamente:

```sql
alter table public.profiles
  add column if not exists tagline text null,
  add column if not exists bio text null,
  add column if not exists language character varying(10) null default 'en',
  add column if not exists birth_date date null;
```

Después de esto, el onboarding podrá guardar tagline, bio, language y birth_date.
