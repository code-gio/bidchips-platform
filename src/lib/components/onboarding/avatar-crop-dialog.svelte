<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import IconCamera from "@tabler/icons-svelte/icons/camera";
  import IconLoader2 from "@tabler/icons-svelte/icons/loader-2";
  import IconCloudUpload from "@tabler/icons-svelte/icons/cloud-upload";

  const CROP_SIZE = 320;
  const MIN_SCALE = 0.2;
  const MAX_SCALE = 3;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  function isAllowedFile(file: File): boolean {
    if (ALLOWED_TYPES.includes(file.type)) return true;
    const name = (file.name ?? "").toLowerCase();
    return ALLOWED_EXT.some((ext) => name.endsWith(ext));
  }

  export type AvatarCropParams = {
    x: number;
    y: number;
    scale: number;
    cropSize: number;
    imageWidth: number;
    imageHeight: number;
  };

  let {
    open = $bindable(false),
    currentAvatarUrl = "",
    initialCrop = null,
    onCropComplete,
  }: {
    open?: boolean;
    /** URL of the current avatar to show when opening (e.g. signed URL or path-based endpoint) */
    currentAvatarUrl?: string;
    /** When opening with an existing avatar, use these crop values so the dialog shows the same position/scale */
    initialCrop?: { x: number; y: number; scale: number } | null;
    /** Called with the original image blob and crop params to save (upload original + store params) */
    onCropComplete?: (blob: Blob, params: AvatarCropParams) => void;
  } = $props();

  let imageSrc = $state<string | null>(null);
  let imageNatural = $state<{ width: number; height: number } | null>(null);
  let crop = $state({ x: 0, y: 0, scale: 0.5 });
  let originalBlob = $state<Blob | null>(null);
  let fileInputEl = $state<HTMLInputElement | null>(null);
  let cropBoxEl = $state<HTMLDivElement | null>(null);
  let imageEl = $state<HTMLImageElement | null>(null);
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0, cropX: 0, cropY: 0 });
  let isProcessing = $state(false);
  let isLoadingCurrent = $state(false);
  let lastLoadedUrl = $state("");
  /** True when we loaded image from URL (not from file picker), so onImageLoad should apply initialCrop */
  let pendingInitialCrop = $state(false);
  let isDragOver = $state(false);

  function resetState() {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    imageSrc = null;
    imageNatural = null;
    originalBlob = null;
    crop = { x: 0, y: 0, scale: 0.5 };
  }

  async function loadCurrentAvatar(url: string) {
    isLoadingCurrent = true;
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    imageSrc = null;
    imageNatural = null;
    originalBlob = null;
    crop = { x: 0, y: 0, scale: 0.5 };
    try {
      const isSameOrigin =
        typeof location !== "undefined" &&
        (url.startsWith("/") || new URL(url, location.origin).origin === location.origin);
      const res = await fetch(url, {
        credentials: isSameOrigin ? "include" : "omit",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      originalBlob = blob;
      imageSrc = URL.createObjectURL(blob);
      pendingInitialCrop = true;
    } catch {
      // leave empty, user can choose image
    } finally {
      isLoadingCurrent = false;
    }
  }

  function handleOpenChange(isOpen: boolean) {
    open = isOpen;
    if (!isOpen) {
      lastLoadedUrl = "";
      pendingInitialCrop = false;
      originalBlob = null;
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      imageSrc = null;
      imageNatural = null;
    }
  }

  $effect(() => {
    if (!open) {
      lastLoadedUrl = "";
      return;
    }
    const url = (currentAvatarUrl ?? "").trim();
    if (url && url !== lastLoadedUrl) {
      lastLoadedUrl = url;
      loadCurrentAvatar(url);
    } else if (!url) {
      lastLoadedUrl = "";
      // No resetear si el usuario acaba de elegir una imagen (imageSrc ya está puesto)
      if (!imageSrc) resetState();
    }
  });

  function triggerFileInput() {
    fileInputEl?.click();
  }

  function processFile(file: File | null) {
    if (!file) return;
    if (!isAllowedFile(file)) return;
    if (file.size > MAX_FILE_SIZE) return;
    pendingInitialCrop = false;
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    originalBlob = file;
    imageSrc = URL.createObjectURL(file);
    crop = { x: 0, y: 0, scale: 0.5 };
  }

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    processFile(file ?? null);
    input.value = "";
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer?.types.includes("Files")) return;
    isDragOver = true;
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      isDragOver = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
    const file = e.dataTransfer?.files?.[0];
    processFile(file ?? null);
  }

  function onImageLoad() {
    const img = imageEl;
    if (!img) return;
    imageNatural = { width: img.naturalWidth, height: img.naturalHeight };
    if (pendingInitialCrop && initialCrop != null) {
      const x = typeof initialCrop.x === "number" ? initialCrop.x : 0;
      const y = typeof initialCrop.y === "number" ? initialCrop.y : 0;
      const scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, typeof initialCrop.scale === "number" ? initialCrop.scale : 0.5)
      );
      crop = { x, y, scale };
      pendingInitialCrop = false;
    } else {
      const fit = Math.min(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
      crop = { ...crop, scale: Math.min(Math.max(fit, MIN_SCALE), MAX_SCALE) };
    }
  }

  function onCropAreaPointerDown(e: PointerEvent) {
    if (!imageSrc) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY, cropX: crop.x, cropY: crop.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onCropAreaPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    crop = {
      ...crop,
      x: dragStart.cropX + (e.clientX - dragStart.x),
      y: dragStart.cropY + (e.clientY - dragStart.y),
    };
  }

  function onCropAreaPointerUp(e: PointerEvent) {
    if (isDragging) {
      isDragging = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }

  function onScaleInput(e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    crop = { ...crop, scale: v };
  }

  function getImageStyle(): string {
    if (!imageNatural) return "";
    const { width: nw, height: nh } = imageNatural;
    const s = crop.scale;
    const w = nw * s;
    const h = nh * s;
    const left = CROP_SIZE / 2 - w / 2 + crop.x;
    const top = CROP_SIZE / 2 - h / 2 + crop.y;
    return `width: ${w}px; height: ${h}px; left: ${left}px; top: ${top}px;`;
  }

  function applyCrop() {
    if (!originalBlob || !imageNatural) return;
    isProcessing = true;
    const { width: nw, height: nh } = imageNatural;
    const params: AvatarCropParams = {
      x: crop.x,
      y: crop.y,
      scale: crop.scale,
      cropSize: CROP_SIZE,
      imageWidth: nw,
      imageHeight: nh,
    };
    isProcessing = false;
    onCropComplete?.(originalBlob, params);
    open = false;
  }

  const fileInputId =
    "avatar-crop-file-" +
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2));
</script>

<!-- Input fuera del Dialog para que el label (dentro del portal) y el input estén en el mismo document -->
<input
  id={fileInputId}
  bind:this={fileInputEl}
  type="file"
  accept={ALLOWED_TYPES.join(",")}
  class="absolute opacity-0 pointer-events-none w-0 h-0"
  onchange={onFileChange}
  aria-hidden="true"
  tabindex="-1"
/>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content
    class="p-0 gap-0 overflow-hidden {imageSrc || isLoadingCurrent ? 'sm:max-w-[calc(320px+3rem)]' : 'sm:max-w-2xl'}"
    showCloseButton={true}
  >
    <Dialog.Header class="px-6 pt-6 pb-4">
      <Dialog.Title>{imageSrc ? "Profile photo" : "Upload photo"}</Dialog.Title>
      <Dialog.Description class="my-3">
        {#if imageSrc}
          Adjust the crop. Only the area inside the frame will be used.
        {:else}
         Select or drag your profile photo here.
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    <div class="px-6 pb-4">
      {#if isLoadingCurrent}
        <div
          class="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border border-muted bg-muted/30"
        >
          <IconLoader2 class="size-12 animate-spin text-muted-foreground" />
          <span class="text-sm text-muted-foreground">Loading current photo…</span>
        </div>
      {:else if !imageSrc}
        <label
          for={fileInputId}
          class="flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-muted/20 py-10 transition-colors {isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30'}"
          ondragover={onDragOver}
          ondragleave={onDragLeave}
          ondrop={onDrop}
        >
          <IconCloudUpload class="size-10 text-primary" aria-hidden="true" />
          <div class="flex flex-col items-center gap-1 text-center">
            <span class="font-semibold text-foreground text-2xl mb-3">Upload photo</span>
            <span class="text-sm text-muted-foreground">
              Drag and drop your profile photo here, or click to browse.
            </span>
          </div>
          <span
            class="inline-flex h-10 items-center justify-center rounded-full bg-[#895EFF] px-6 text-sm font-medium text-white hover:bg-[#895EFF]/90 pointer-events-none"
          >
            Upload Photo
          </span>
        </label>
      {:else}
        <div class="space-y-4">
          <div
            bind:this={cropBoxEl}
            class="relative overflow-hidden rounded-full border border-muted bg-muted"
            style="width: {CROP_SIZE}px; height: {CROP_SIZE}px; margin: 0 auto;"
            role="img"
            aria-label="Crop preview"
            onpointerdown={onCropAreaPointerDown}
            onpointermove={onCropAreaPointerMove}
            onpointerup={onCropAreaPointerUp}
            onpointercancel={onCropAreaPointerUp}
            class:select-none={isDragging}
            class:cursor-grab={!isDragging && imageSrc}
            class:cursor-grabbing={isDragging}
          >
            <div
              class="absolute top-0 left-0"
              style={getImageStyle()}
            >
              <img
                bind:this={imageEl}
                src={imageSrc}
                alt=""
                class="block max-w-none"
                style="width: {imageNatural ? imageNatural.width * crop.scale : 0}px; height: {imageNatural ? imageNatural.height * crop.scale : 0}px;"
                onload={onImageLoad}
                draggable="false"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label for="crop-zoom" class="text-xs font-medium text-muted-foreground">Zoom</label>
            <input
              id="crop-zoom"
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step="0.05"
              value={crop.scale}
              oninput={onScaleInput}
              class="w-full accent-primary"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={triggerFileInput}
            class="w-full"
          >
            Choose another image
          </Button>
        </div>
      {/if}
    </div>

    <Dialog.Footer class="border-t px-6 py-4">
      <Button type="button" variant="secondary" onclick={() => (open = false)} class=" rounded-full cursor-pointer py-4">
        {imageSrc ? "Cancel" : "Close"}
      </Button>
      {#if imageSrc}
        <Button
          type="button"
          disabled={isProcessing}
          onclick={applyCrop}
        >
          {#if isProcessing}
            <IconLoader2 class="size-4 animate-spin" />
            Applying…
          {:else}
            Apply
          {/if}
        </Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
