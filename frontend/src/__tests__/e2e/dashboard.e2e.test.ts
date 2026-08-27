import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('guardia_001').fill('supervisor_001');
    await page.getByPlaceholder('••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/dashboard');
  });

  test('debería cargar los KPIs y la tabla de personas presentes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '📊 Dashboard' })).toBeVisible();
    await expect(page.getByText('Personas Actuales')).toBeVisible();
    await expect(page.getByText('Personal Propio')).toBeVisible();
    await expect(page.getByText('Visitantes')).toBeVisible();
    await expect(page.getByText('Vehículos')).toBeVisible();
    await expect(page.getByText(/Última actualización/)).toBeVisible();
  });

  test('debería impedir el acceso a /access para un SUPERVISOR', async ({ page }) => {
    await page.goto('/access');
    await page.waitForURL('**/unauthorized');
    expect(page.url()).toContain('/unauthorized');
  });

  test('logout debería cerrar sesión y redirigir a /login', async ({ page }) => {
    await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');

    // Confirmar que ya no se puede volver a /dashboard sin loguearse de nuevo
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
  });
});
