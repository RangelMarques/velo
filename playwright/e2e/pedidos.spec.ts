import { test, expect } from '@playwright/test';
/// AAA - Arrange, Act, Assert

test('test', async ({ page }) => {

    //Arrange - Preparar o teste
    await page.goto('http://localhost:5173/');
    await page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' }).click();

    //Act - Executar a ação
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    //Assert - Verificar o resultado
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

    //Act - Executar a ação
    await page.getByTestId('search-order-id').click();
    await page.getByTestId('search-order-id').fill('VLO-ZHG2KJ');
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
    //await page.getByTestId('search-order-button').click();
    
    //Assert - Verificar o resultado
    //await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
    //await expect(page.getByTestId('order-result-id')).toContainText('VLO-ZHG2KJ');
    await page.getByText('APROVADO').click();
    await page.getByText('teste rm7 teste').click();
    await page.getByText('rm7@teste.com').click();


});