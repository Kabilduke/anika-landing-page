## Context

The storefront web application uses React and Supabase for passwordless authentication. While the frontend expects a 6-digit numeric OTP token, the local and production Supabase backend sends a generic unbranded magic link email by default. 

## Goals / Non-Goals

**Goals:**
- Implement a premium-branded email template for Anika Fashion.
- Switch the email verification flow from a clickable Magic Link to a 6-digit numeric OTP code (One-Time Password).
- Maintain GitOps alignment by syncing local templates and cloud-hosted templates using Terraform in CI/CD.

**Non-Goals:**
- Custom SMTP provider configuration for local development (continue using local Inbucket mail catcher).
- Editing password recovery or user invitation templates, which are out of scope for this login fix.

## Decisions

### Decision 1: Use `{{ .Token }}` placeholder in `magic_link` template
- **Rationale**: When Supabase GoTrue server parses a magic link template containing `{{ .Token }}` instead of `{{ .ConfirmationURL }}`, it automatically generates and sends a 6-digit verification code.
- **Alternatives Considered**: Direct SMS authentication (more expensive, requires active Twilio configuration).

### Decision 2: Sync templates with production via Terraform
- **Rationale**: Reading the local template using Terraform's `file()` function and supplying it to `supabase_settings.main.auth` keeps the cloud environment in sync with git without requiring manual edits in the Supabase Dashboard.
- **Alternatives Considered**: Manual dashboard updates (prone to configuration drift across environments).

### Decision 3: Use Resend as the SMTP Provider
- **Rationale**: Resend provides a modern developer experience, fast domain DNS verification, and a generous free tier of 3,000 emails/month (100/day), which is ideal for staging and growth.

## Risks / Trade-offs

- **[Risk]** Missing custom SMTP configurations in production will cause custom templates to be ignored.
  - *Mitigation*: Terraform configuration will expose variables for SMTP settings, and the deployment guide will document how to set up Resend SMTP.
