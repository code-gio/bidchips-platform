<script lang="ts">
  /**
   * Displays an avatar image applying saved crop params (position + scale)
   * so the same region chosen in the crop dialog is shown.
   */
  let {
    src = "",
    size = 96,
    alt = "Avatar",
    class: className = "",
    /** Crop params from the editor (cropSize default 320) */
    cropX = null,
    cropY = null,
    cropScale = null,
    cropSize = 320,
    imageWidth = null,
    imageHeight = null,
  }: {
    src?: string;
    size?: number;
    alt?: string;
    class?: string;
    cropX?: number | null;
    cropY?: number | null;
    cropScale?: number | null;
    cropSize?: number | null;
    imageWidth?: number | null;
    imageHeight?: number | null;
  } = $props();

  const hasCrop = $derived(
    Boolean(
      src &&
        cropX != null &&
        cropY != null &&
        cropScale != null &&
        cropScale > 0 &&
        imageWidth != null &&
        imageHeight != null
    )
  );

  const cropStyle = $derived.by(() => {
    if (!hasCrop || cropSize == null) return null;
    const nw = imageWidth!;
    const nh = imageHeight!;
    const s = cropScale!;
    const C = cropSize;
    const x = cropX!;
    const y = cropY!;
    const w = nw * s;
    const h = nh * s;
    const left = C / 2 - w / 2 + x;
    const top = C / 2 - h / 2 + y;
    const srcX = Math.max(0, -left / s);
    const srcY = Math.max(0, -top / s);
    const srcW = Math.min(nw - srcX, C / s);
    const srcH = Math.min(nh - srcY, C / s);
    if (srcW <= 0 || srcH <= 0) return null;
    const D = size;
    const imgW = (D / srcW) * nw;
    const imgH = (D / srcH) * nh;
    const imgLeft = -(srcX / nw) * imgW;
    const imgTop = -(srcY / nh) * imgH;
    return {
      width: `${imgW}px`,
      height: `${imgH}px`,
      left: `${imgLeft}px`,
      top: `${imgTop}px`,
    };
  });
</script>

{#if src}
  <div
    class="relative overflow-hidden rounded-full bg-muted {className}"
    style="width: {size}px; height: {size}px;"
    role="img"
    aria-label={alt}
  >
    {#if hasCrop && cropStyle}
      <img
        src={src}
        alt={alt}
        class="absolute left-0 top-0 max-w-none"
        style="width: {cropStyle.width}; height: {cropStyle.height}; left: {cropStyle.left}; top: {cropStyle.top};"
        loading="lazy"
        decoding="async"
      />
    {:else}
      <img
        src={src}
        alt={alt}
        class="h-full w-full object-cover"
        style="width: {size}px; height: {size}px;"
        loading="lazy"
        decoding="async"
      />
    {/if}
  </div>
{/if}
