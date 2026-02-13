<script lang="ts">
  import { Field, FieldContent, FieldLabel, FieldError } from "$lib/components/ui/field";
  import { Input } from "$lib/components/ui/input";
  import { signUpSchema, type SignUpSchema } from "$lib/schemas/sign-up";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { Progress } from "$lib/components/ui/progress";
  import Checkbox from "../ui/checkbox/checkbox.svelte";
  import Button from "../ui/button/button.svelte";
  import {
    IconEye,
    IconEyeOff,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let { data }: { data: SuperValidated<Infer<SignUpSchema>> } = $props();

  let showPassword = $state(false);
  let isSubmitting = $state(false);
  let passwordFocused = $state(false);

  // Call superForm only once. If we call it again when the parent re-renders (e.g. after
  // invalidate("supabase:auth")), it re-initializes with empty data and the server gets empty form.
  let formInstance = $state<ReturnType<typeof superForm<Infer<SignUpSchema>>> | null>(null);
  if (formInstance === null) {
    formInstance = superForm(data, {
      validators: zod4Client(signUpSchema),
      applyAction: "never",
      onSubmit: () => {
        isSubmitting = true;
      },
      onResult: async ({ result }) => {
        isSubmitting = false;
        if (result.type === "failure") {
          toast.error(result.data?.message || "Sign up failed", {
            description: "Please check your input and try again.",
          });
          return;
        }
        if (result.type === "success") {
          toast.success("Account created successfully", {
            description: "Please check your email to verify your account.",
          });
          const email = result.data?.form?.data?.email ?? "";
          await goto("/verify-email?email=" + encodeURIComponent(email));
        }
      },
    });
  }

  // Helper function to normalize superforms errors to FieldError format
  function normalizeErrors(error: any): { message?: string }[] | undefined {
    if (!error) return undefined;
    if (typeof error === "string") return [{ message: error }];
    if (Array.isArray(error)) {
      return error.map((e) => ({ message: typeof e === "string" ? e : String(e) }));
    }
    // Nested shape e.g. { agreeToTerms: ["message"] } from refine path
    if (typeof error === "object" && !Array.isArray(error)) {
      const firstKey = Object.keys(error)[0];
      const nested = firstKey != null ? error[firstKey] : undefined;
      if (Array.isArray(nested)) return normalizeErrors(nested);
    }
    return [{ message: String(error) }];
  }

  // Simple password strength calculation
  function calculatePasswordStrength(password: string | undefined): {
    score: number;
    label: string;
    color: string;
  } {
    if (!password) {
      return { score: 0, label: "", color: "bg-gray-200" };
    }

    const length = password.length;
    let score = 0;

    // Simple scoring based on length
    if (length >= 6) score = 30;
    if (length >= 8) score = 60;
    if (length >= 12) score = 100;

    // Determine strength label and color
    if (score < 30) {
      return { score: 0, label: "", color: "bg-gray-200" };
    } else if (score < 60) {
      return { score: 30, label: "Weak", color: "bg-yellow-500" };
    } else if (score < 100) {
      return { score: 60, label: "Good", color: "bg-blue-500" };
    } else {
      return { score: 100, label: "Strong", color: "bg-green-500" };
    }
  }

  const { form: formData, enhance, errors } = formInstance!;

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }


  $effect(() => {

    if (isSubmitting) {
      showPassword = false;
    }
  });

  // Reactive password strength with null check
  let strength = $derived(calculatePasswordStrength($formData?.password));
</script>

<form
  method="POST"
  use:enhance
  class="space-y-3"
  aria-label="Sign up form"
  novalidate
>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
    <Field>
      <FieldContent>
        <FieldLabel for="firstName">First Name</FieldLabel>
        <Input
          id="firstName"
          name="firstName"
          bind:value={$formData.firstName}
          placeholder="John"
          autocomplete="given-name"
          required
          class="transition-all duration-200"
          aria-invalid={$errors.firstName ? "true" : undefined}
          aria-describedby={$errors.firstName ? "firstName-error" : undefined}
        />
      </FieldContent>
      <FieldError id="firstName-error" errors={normalizeErrors($errors.firstName)} />
    </Field>

    <Field>
      <FieldContent>
        <FieldLabel for="lastName">Last Name</FieldLabel>
        <Input
          id="lastName"
          name="lastName"
          bind:value={$formData.lastName}
          placeholder="Smith"
          autocomplete="family-name"
          required
          class="transition-all duration-200"
          aria-invalid={$errors.lastName ? "true" : undefined}
          aria-describedby={$errors.lastName ? "lastName-error" : undefined}
        />
      </FieldContent>
      <FieldError id="lastName-error" errors={normalizeErrors($errors.lastName)} />
    </Field>
  </div>

  <Field>
    <FieldContent>
      <FieldLabel for="username">Username</FieldLabel>
      <Input
        id="username"
        name="username"
        bind:value={$formData.username}
        placeholder="johndoe"
        autocomplete="username"
        required
        class="transition-all duration-200"
        aria-invalid={$errors.username ? "true" : undefined}
        aria-describedby={$errors.username ? "username-error" : undefined}
      />
    </FieldContent>
    <FieldError id="username-error" errors={normalizeErrors($errors.username)} />
    <p class="text-sm text-muted-foreground mt-1">
      Only letters, numbers, underscores, and hyphens allowed
    </p>
  </Field>

  <Field>
    <FieldContent>
      <FieldLabel for="email">Email</FieldLabel>
      <Input
        id="email"
        name="email"
        type="email"
        bind:value={$formData.email}
        placeholder="you@email.com"
        autocomplete="email"
        required
        class="transition-all duration-200"
        aria-invalid={$errors.email ? "true" : undefined}
        aria-describedby={$errors.email ? "email-error" : undefined}
      />
    </FieldContent>
    <FieldError id="email-error" errors={normalizeErrors($errors.email)} />
  </Field>

  <Field>
    <FieldContent>
      <FieldLabel for="password">Password</FieldLabel>
      <div class="space-y-2">
        <div class="relative">
          <Input
            id="password"
            name="password"
            bind:value={$formData.password}
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            autocomplete="new-password"
            required
            onfocus={() => (passwordFocused = true)}
            onblur={() => (passwordFocused = false)}
            class="pr-10 transition-all duration-200"
            aria-invalid={$errors.password ? "true" : undefined}
            aria-describedby="password-strength password-requirements password-error"
          />
          <Button
            size="icon"
            variant="ghost"
            class="absolute right-3 top-1/2 -translate-y-1/2"
            onclick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {#if showPassword}
              <IconEyeOff size={16} />
            {:else}
              <IconEye size={16} />
            {/if}
          </Button>
        </div>

        {#if $formData?.password}
          <div
            class="space-y-1"
            id="password-strength"
            role="region"
            aria-label="Password strength indicator"
          >
            <div class="flex justify-between text-sm">
              <span>Password Strength:</span>
              <span
                class:text-red-500={strength.label === "Too Weak"}
                class:text-yellow-500={strength.label === "Moderate"}
                class:text-blue-500={strength.label === "Strong"}
                class:text-green-500={strength.label === "Very Strong"}
              >
                {strength.label}
              </span>
            </div>

            <Progress
              value={strength.score}
              max={100}
              class="h-full w-full flex-1 transition-all duration-300 {strength.color}"
              style="transform: translateX(-{100 - strength.score}%)"
            />
          </div>
        {/if}
      </div>
    </FieldContent>

    {#if passwordFocused && $formData?.password}
      <div
        class="mt-2 text-sm text-muted-foreground"
        id="password-requirements"
        role="region"
        aria-label="Password requirements"
      >
        Password must be at least 6 characters long
      </div>
    {/if}
    <FieldError id="password-error" errors={normalizeErrors($errors.password)} />
  </Field>

  <Field>
    <FieldContent>
      <div class="flex items-center gap-2">
        <input
          type="hidden"
          name="agreeToTerms"
          value={$formData.agreeToTerms ? "true" : "false"}
          aria-hidden="true"
        />
        <Checkbox
          id="terms"
          bind:checked={$formData.agreeToTerms}
          aria-invalid={$errors.agreeToTerms ? "true" : undefined}
          aria-describedby={$errors.agreeToTerms ? "terms-error" : undefined}
        />
        <FieldLabel for="terms" class="text-sm">
          I accept the
          <Button
            variant="link"
            href="/terms-and-conditions"
            class="px-1 py-0 h-auto font-medium"
          >
            Terms and Conditions
          </Button>
        </FieldLabel>
      </div>
    </FieldContent>
    <FieldError id="terms-error" errors={normalizeErrors($errors.agreeToTerms)} />
  </Field>

  <Button class="w-full" disabled={isSubmitting} type="submit">
    {#if isSubmitting}
      Creating account...
    {:else}
      Create Account
    {/if}
  </Button>
</form>
