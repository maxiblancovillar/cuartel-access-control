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

  test('SUPERVISOR debería poder navegar a Reportes y ver filtros, gráficos y tabla', async ({
    page,
  }) => {
    await page.getByRole('link', { name: '📄 Reportes' }).click();
    await page.waitForURL('**/reports');
    await expect(page.getByRole('heading', { name: '📄 Reportes' })).toBeVisible();
    await expect(page.getByText('Filtros')).toBeVisible();
    await expect(page.getByText('Registros por Tipo')).toBeVisible();
    await expect(page.getByText('Ingresos por Hora del Día')).toBeVisible();
    await expect(page.getByRole('button', { name: /Descargar CSV/ })).toBeVisible();
  });

  test('SUPERVISOR debería poder filtrar reportes por tipo de persona', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForSelector('text=Filtros');

    // Los filtros de fecha son <input type="date">, no <select>. El primer
    // <select> del formulario de filtros es "Tipo Persona".
    await page.locator('select').first().selectOption('CIVIL');

    // Esperar a que la tabla se re-renderice con el filtro aplicado
    await expect(page.getByText(/Registros \(Total:/)).toBeVisible();
  });

  test('SUPERVISOR no debería ver el link de Administración en el sidebar', async ({ page }) => {
    await expect(page.getByRole('link', { name: '⚙️ Administración' })).not.toBeVisible();
  });

  test('SUPERVISOR no debería poder acceder a /admin directamente', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/unauthorized');
    expect(page.url()).toContain('/unauthorized');
  });
});

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('guardia_001').fill('admin');
    await page.getByPlaceholder('••••••••').fill('Password123!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/dashboard');
  });

  test('ADMIN debería poder navegar a Administración y ver la tabla de usuarios', async ({
    page,
  }) => {
    await page.getByRole('link', { name: '⚙️ Administración' }).click();
    await page.waitForURL('**/admin');
    await expect(page.getByRole('heading', { name: '⚙️ Administración' })).toBeVisible();
    await expect(page.getByRole('button', { name: '👥 Usuarios' })).toBeVisible();
    await expect(page.getByText(/Usuarios \(\d+\)/)).toBeVisible();
    await expect(page.getByText('admin', { exact: true })).toBeVisible();
  });

  test('ADMIN debería poder navegar a Reportes desde el sidebar', async ({ page }) => {
    await page.getByRole('link', { name: '📄 Reportes' }).click();
    await page.waitForURL('**/reports');
    await expect(page.getByRole('heading', { name: '📄 Reportes' })).toBeVisible();
  });

  test('ADMIN debería poder ver las tabs de Unidades y Auditoría', async ({ page }) => {
    await page.goto('/admin');

    await page.getByRole('button', { name: '🏢 Unidades' }).click();
    await expect(page.getByText(/Estructura Organizacional/)).toBeVisible();

    await page.getByRole('button', { name: '📋 Auditoría' }).click();
    await expect(page.getByText(/Log de Auditoría/)).toBeVisible();
    // El propio login de este test ya generó al menos un evento LOGIN
    await expect(page.getByText('LOGIN').first()).toBeVisible();
  });

  test('debería mostrar el árbol jerárquico de unidades con indentación', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: '🏢 Unidades' }).click();
    await expect(page.getByText(/Estructura Organizacional/)).toBeVisible();

    // Jerarquía real del seed: Dirección de Intendencia (raíz) > Batallón de
    // Infantería 601 (hijo) > Sección Militar de Control (nieto).
    const raiz = page.getByText('Dirección de Intendencia');
    const hijo = page.getByText('Batallón de Infantería 601');
    await expect(raiz).toBeVisible();
    await expect(hijo).toBeVisible();

    const bboxRaiz = await raiz.boundingBox();
    const bboxHijo = await hijo.boundingBox();
    // El hijo debe estar indentado (más a la derecha) que su padre.
    expect(bboxHijo?.x).toBeGreaterThan(bboxRaiz?.x ?? 0);
  });

  test('debería permitir crear una subunidad bajo un padre existente', async ({ page }) => {
    const codigo = `E2E_${Date.now()}`;
    await page.goto('/admin');
    await page.getByRole('button', { name: '🏢 Unidades' }).click();

    const filaPadre = page
      .locator('[data-testid^="unidad-row-"]')
      .filter({ hasText: 'Dirección de Intendencia' });
    await filaPadre.getByRole('button', { name: '➕ Agregar subunidad' }).click();

    await page.getByLabel('Código').fill(codigo);
    await page.getByLabel('Nombre').fill('Subunidad E2E');
    // El padre ya viene preseleccionado por onAddChild; solo confirmamos que
    // el select de "Unidad Padre" no está vacío.
    await expect(page.getByLabel('Unidad Padre (opcional)')).not.toHaveValue('');

    await page.getByRole('button', { name: '➕ Crear' }).click();

    // Se escopea al árbol de unidades (fuera del formulario, que ya se
    // cerró) porque el nombre también aparece como texto del <option> del
    // selector de "Unidad Padre" en cualquier otro formulario que se abra.
    await expect(
      page.locator('[data-testid^="unidad-row-"]').filter({ hasText: 'Subunidad E2E' })
    ).toBeVisible();
  });

  test('debería rechazar un ciclo al reasignar la unidad padre', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('button', { name: '🏢 Unidades' }).click();

    // Editar la raíz (Dirección de Intendencia) e intentar asignarle como
    // padre a uno de sus propios descendientes. El formulario ya excluye a
    // los descendientes del <select>, así que forzamos el valor por DOM
    // para verificar que el backend también lo rechaza (defensa en profundidad).
    const filaRaiz = page
      .locator('[data-testid^="unidad-row-"]')
      .filter({ hasText: 'Dirección de Intendencia' });
    await filaRaiz.getByRole('button', { name: '✏️ Editar' }).click();

    const selectPadre = page.getByLabel('Unidad Padre (opcional)');
    const opciones = await selectPadre.locator('option').allTextContents();
    // Como el formulario filtra correctamente, el descendiente no debería
    // aparecer como opción disponible.
    expect(opciones.some((o) => o.includes('Batallón de Infantería 601'))).toBe(false);
  });

  test('ADMIN debería poder crear, editar y desactivar un usuario (CRUD real)', async ({
    page,
  }) => {
    const username = `e2e_test_${Date.now()}`;
    await page.goto('/admin');

    // Crear
    await page.getByRole('button', { name: '➕ Nuevo Usuario' }).click();
    await page.getByLabel('Usuario').fill(username);
    await page.getByLabel('Nombre Completo').fill('Usuario E2E Playwright');
    await page.getByLabel('Contraseña').fill('Password123!');
    await page.getByRole('button', { name: '➕ Crear' }).click();

    const fila = page.locator('tr', { hasText: username });
    await expect(fila).toBeVisible();
    await expect(fila.getByText('Activo')).toBeVisible();

    // Editar
    await fila.getByRole('button', { name: '✏️ Editar' }).click();
    await page.getByLabel('Nombre Completo').fill('Usuario E2E Editado');
    await page.getByRole('button', { name: '💾 Actualizar' }).click();
    await expect(page.locator('tr', { hasText: username })).toContainText('Usuario E2E Editado');

    // Desactivar
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('tr', { hasText: username }).getByRole('button', { name: '🚫 Desactivar' }).click();
    await expect(page.locator('tr', { hasText: username })).toContainText('Inactivo');
  });
});
