import { test, expect } from '@playwright/test';
import { generateOrderCode } from '../support/helpers';
/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {

    test.beforeEach(async ({ page }) => { //roda antes de cada teste
        // Arrange - Preparar o teste
        await page.goto('http://localhost:5173/');
        await page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' }).click();

        // Act - Executar a ação
        await page.getByRole('link', { name: 'Consultar Pedido' }).click();
        // Assert - Verificar o resultado
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    })

    test('Deve consultar um pedido aprovado', async ({ page }) => {

        // Test Data
        const order = {

            number: 'VLO-ZHG2KJ',
            status: 'APROVADO',
            color: 'Glacier Blue',
            wheels: 'sport Wheels',
            customer: {
                name: 'teste rm7 teste',
                email: 'rm7@teste.com'
            },
            payment: 'À Vista'
        }

        // Act - Executar a ação
        await page.getByTestId('search-order-id').fill(order.number);
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();

        // Assert - Verificar o resultado
        // await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');

        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - status:
               - img
               - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

        const statusBadge = page.getByRole('status').filter({ hasText: order.status })

        await expect(statusBadge).toHaveClass(/bg-green-100/)
        await expect(statusBadge).toHaveClass(/text-green-700/)

        const statusIcon = statusBadge.locator('svg')
        await expect(statusIcon).toHaveClass(/lucide-circle-check-big/)

    })

    test('Deve consultar um pedido reprovado', async ({ page }) => {

        // Test Data
        const order = {

            number: 'VLO-63Y29V',
            status: 'REPROVADO',
            color: 'Midnight Black',
            wheels: 'sport Wheels',
            customer: {
                name: 'Steve Jobs',
                email: 'steve@apple.com'
            },
            payment: 'À Vista'
        }

        // Act - Executar a ação
        await page.getByTestId('search-order-id').fill(order.number);
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();

        // Assert - Verificar o resultado
        // await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');

        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - status:
               - img
               - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

            const statusBadge = page.getByRole('status').filter({ hasText: order.status })

            await expect(statusBadge).toHaveClass(/bg-red-100/)
            await expect(statusBadge).toHaveClass(/text-red-700/)
    
            const statusIcon = statusBadge.locator('svg')
            await expect(statusIcon).toHaveClass(/lucide-circle-x/)
    })

    test('Deve consultar um pedido em analise', async ({ page }) => {

        // Test Data
        const order = {

            number: 'VLO-T8T63W',
            status: 'EM_ANALISE',
            color: 'Lunar White',
            wheels: 'aero Wheels',
            customer: {
                name: 'João da Silva',
                email: 'joao@teste.com'
            },
            payment: 'À Vista'
        }

        // Act - Executar a ação
        await page.getByTestId('search-order-id').fill(order.number);
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();

        // Assert - Verificar o resultado
        // await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');

        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - status:
               - img
               - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

            const statusBadge = page.getByRole('status').filter({ hasText: order.status })

            await expect(statusBadge).toHaveClass(/bg-yellow-100/)
            await expect(statusBadge).toHaveClass(/text-yellow-700/)
    
            const statusIcon = statusBadge.locator('svg')
            await expect(statusIcon).toHaveClass(/lucide-clock3/)

    })

    test('Deve exibir mensagem quando o pedido nao é encontrado', async ({ page }) => {
        const order = generateOrderCode();

        await page.getByTestId('search-order-id').fill(order);
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();

        // await expect(page.locator('#root')).toContainText('Pedido não encontrado');
        // await expect(page.locator('#root')).toContainText('Verifique o número do pedido e tente novamente');

        await expect(page.locator('#root')).toMatchAriaSnapshot(`
            - img
            - heading "Pedido não encontrado" [level=3]
            - paragraph: Verifique o número do pedido e tente novamente
            `)

    })

})