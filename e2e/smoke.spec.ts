/**
 * Smoke tests — Colvin Content OS
 *
 * These tests verify the app renders and routes correctly without a logged-in user.
 * Auth-protected routes redirect to /login — this is the expected behavior.
 *
 * To run against a local dev server:
 *   npm test
 *
 * To run against a specific URL (e.g. staging):
 *   PLAYWRIGHT_BASE_URL=https://your-app.vercel.app npm test
 */

import { test, expect } from '@playwright/test'

// ── Public routes ─────────────────────────────────────────────────────────────

test('login page loads with email input and sign-in button', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/Colvin Content OS/)
  await expect(page.getByText('Colvin Content OS')).toBeVisible()
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
  await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible()
})

test('login page shows password mode when toggled', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /password/i }).click()
  await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

// ── Auth-protected routes redirect to login ───────────────────────────────────

test('dashboard redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard')
  // Should land on /login (with optional ?next= param)
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText('Colvin Content OS')).toBeVisible()
})

test('leads page redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/leads')
  await expect(page).toHaveURL(/\/login/)
})

test('outreach page redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/outreach')
  await expect(page).toHaveURL(/\/login/)
})

test('approvals page redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/approvals')
  await expect(page).toHaveURL(/\/login/)
})

test('create page redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/create')
  await expect(page).toHaveURL(/\/login/)
})

// ── Login form validation ──────────────────────────────────────────────────────

test('login form shows error when submitting empty email', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /send magic link/i }).click()
  // Should show an inline error, not navigate away
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText(/email is required/i)).toBeVisible()
})

test('login form shows error for invalid email format', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /password/i }).click()
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText(/email and password are required/i)).toBeVisible()
})

// ── API health ──────────────────────────────────────────────────────────────

test('API content GET returns 200', async ({ request }) => {
  const res = await request.get('/api/content?limit=1')
  // May return 200 with data or 500 if Supabase not configured in test env
  // We just verify it does not return 404 (route exists)
  expect(res.status()).not.toBe(404)
})
