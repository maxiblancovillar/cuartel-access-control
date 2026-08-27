import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('debería completar login como OPERADOR y redirigir a /access', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('guardia_001').fill('guardia_001');
    await page.getByPlaceholder('••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await page.waitForURL('**/access');
    expect(page.url()).toContain('/access');
  });

  test('debería completar login como SUPERVISOR y redirigir a /dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('guardia_001').fill('supervisor_001');
    await page.getByPlaceholder('••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('guardia_001').fill('guardia_001');
    await page.getByPlaceholder('••••••••').fill('WrongPassword123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByText(/Usuario o contraseña inválidos|Error en la autenticación/)).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('debería mostrar errores de validación con campos vacíos', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.getByText('Usuario mínimo 3 caracteres')).toBeVisible();
    await expect(page.getByText('Contraseña mínimo 8 caracteres')).toBeVisible();
  });

  test('debería redirigir a /login al intentar acceder a una ruta protegida sin sesión', async ({
    page,
  }) => {
    await page.goto('/access');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});
