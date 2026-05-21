import { test, expect } from '../support/fixtures'

test.describe('Página de Sucesso', () => {

  test('deve redirecionar para a home caso acessada diretamente sem um pedido no state', async ({ page }) => {
    // Arrange
    // Nenhuma configuração prévia, acessa direto
    
    // Act
    await page.goto('/success')

    // Assert
    await expect(page).toHaveURL('http://localhost:5173/') // A URL raiz. Playwright base_url + /
  })

  test('deve realizar navegações de pós-venda corretamente', async ({ app, page }) => {
    // Para testar os botões na página de sucesso, primeiro criamos um pedido rapidamente
    const customer = {
      name: 'Bruce',
      lastname: 'Wayne',
      email: 'bruce@wayne.com',
      document: '12345678909',
      phone: '(11) 99999-9999',
      store: 'Velô Paulista',
      paymentMethod: 'À Vista',
      totalPrice: 'R$ 40.000,00'
    }

    // Arrange - Realizar checkout rápido
    await app.hero.open()
    await app.configurator.expectPrice(customer.totalPrice)
    await app.configurator.finishConfigurator()
    await app.checkout.expectLoaded()

    await app.checkout.fillCustomerData(customer)
    await app.checkout.selectStore(customer.store)
    await app.checkout.selectPaymentMethod(customer.paymentMethod)
    await app.checkout.acceptTerms()
    await app.checkout.submit()

    // Garantir que estamos no Sucesso
    await app.checkout.expectResult('Pedido Aprovado!')

    // Act 1 - Consultar Pedido
    await page.getByTestId('goto-consultar').click()
    
    // Assert 1
    await expect(page).toHaveURL(/\/lookup/)

    // Voltar para testar o outro botão
    await page.goBack()
    await app.checkout.expectResult('Pedido Aprovado!')

    // Act 2 - Configurar Outro
    await page.getByTestId('configure-another').click()

    // Assert 2
    await expect(page).toHaveURL(/\/configure/)
  })
})
