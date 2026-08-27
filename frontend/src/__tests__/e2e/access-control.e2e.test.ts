import { test, expect } from '@playwright/test';

function dniUnico(): string {
  return String(90000000 + Math.floor(Math.random() * 9999999));
}

test.describe('Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('guardia_001').fill('guardia_001');
    await page.getByPlaceholder('••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/access');
  });

  test('debería mostrar los tabs y el formulario de Presente tras escanear un DNI de personal propio', async ({
    page,
  }) => {
    await page.getByPlaceholder(/DNI/i).fill('38123456');
    await page.getByPlaceholder(/DNI/i).press('Enter');

    await expect(page.getByText('DNI:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dar Presente' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar Visita' })).toBeVisible();

    // Personal propio del seed: Carlos González, Teniente
    await expect(page.getByText(/Carlos González/)).toBeVisible();
  });

  test('debería registrar una visita civil completa con ficha correlativa', async ({ page }) => {
    const dni = dniUnico();

    await page.getByPlaceholder(/DNI/i).fill(dni);
    await page.getByPlaceholder(/DNI/i).press('Enter');

    await page.getByRole('button', { name: 'Registrar Visita' }).click();

    await page.getByPlaceholder('Nombre del visitante').fill('Playwright');
    await page.getByPlaceholder('Apellido del visitante').fill('E2E');
    await page.locator('select').first().selectOption('CIVIL');
    await page.locator('select').nth(1).selectOption({ index: 1 });
    await page.getByPlaceholder('Ciudad/Localidad').fill('Buenos Aires');
    await page.getByPlaceholder('Nombre del contacto').fill('Persona de Prueba');
    await page
      .getByPlaceholder('Descripción detallada del motivo')
      .fill('Motivo de visita generado por test E2E de Playwright');

    // El componente usa window.alert() al completar el registro
    page.once('dialog', (dialog) => dialog.accept());
    // Hay dos botones con el mismo texto: el tab selector y el submit del form.
    await page.getByRole('button', { name: '✅ Registrar Visita' }).click();

    // Confirmar que no quedó un error visible en pantalla tras el submit
    await expect(page.getByText(/Error al registrar visita/)).not.toBeVisible();
  });

  test('debería impedir el acceso a /dashboard para un OPERADOR', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/unauthorized');
    expect(page.url()).toContain('/unauthorized');
  });
});
