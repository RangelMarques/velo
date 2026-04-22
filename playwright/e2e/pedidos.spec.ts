import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    //Checkpoints
    await page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' }).click();

    //Acessar a página de consulta de pedidos
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();

    //Checkpoint
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

    //Buscar um pedido aprovado
    await page.getByTestId('search-order-id').click();

    //Preencher o campo de busca com o número do pedido
    await page.getByTestId('search-order-id').fill('VLO-ZHG2KJ');
    
    //Clicar no botão de busca
    await page.getByTestId('search-order-button').click();
    
    //Checkpoint
    await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
    await expect(page.getByTestId('order-result-id')).toContainText('VLO-ZHG2KJ');
});