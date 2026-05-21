import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/orderRepository'

test.describe('Checkout', () => {

  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

      alerts = app.checkout.elements.alerts
    })


    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'papito@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {

    const defaultCustomer = {
      name: 'Fernando',
      lastname: 'Papito',
      email: 'papito@teste.com',
      document: '05366127068',
      phone: '(11) 99999-9999',
      store: 'Velô Paulista',
      paymentMethod: 'Financiamento',
      totalPrice: 'R$ 40.000,00'
    }

    async function processFullCheckout(app: any, customer: any) {
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      if (customer.paymentMethod === 'À Vista') {
        await app.checkout.expectSummaryTotal(customer.totalPrice)
      }
      
      if (customer.downPayment) {
        await app.checkout.fillDownPayment(customer.downPayment)
      }
      
      await app.checkout.acceptTerms()
      await app.checkout.submit()
    }

    test.beforeEach(async ({ app }) => {
      await app.hero.open()
    })

    test('deve criar um pedido com sucesso para pagamento à vista', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        paymentMethod: 'À Vista'
      }

      await deleteOrderByEmail(customer.email)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Steve',
        lastname: 'Woz',
        email: 'woz@velo.dev',
        document: '65493881047'
      }

      await deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(710)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Tony',
        lastname: 'Stark',
        email: 'tony@stark.com',
        document: '74690251037'
      }

      await deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(600)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido em Análise!')
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Clark',
        lastname: 'Kent',
        email: 'clark@dailyplanet.com',
        document: '52998224725'
      }

      await deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(500)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido Reprovado!')
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Diana',
        lastname: 'Prince',
        email: 'diana@themiscira.com',
        document: '11144477735',
        downPayment: '10000'
      }

      await deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(500)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido Reprovado!')
    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Richard',
        lastname: 'Fortus',
        email: 'richard@gmail.com',
        document: '39434745004',
        downPayment: '20000'
      }

      await deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(450)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%', async ({ app }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Axl',
        lastname: 'Rose',
        email: 'alx@gnr.com',
        document: '79327557000',
        downPayment: '30000'
      }

      await deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(300)

      // Arrange & Act
      await processFullCheckout(app, customer)

      // Assert
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve exibir mensagem de erro quando a API de análise de crédito falhar (500)', async ({ app, page }) => {

      const customer = {
        ...defaultCustomer,
        name: 'Peter',
        lastname: 'Parker',
        email: 'peter@dailybugle.com',
      }

      await deleteOrderByEmail(customer.email)
      
      // Mock network error
      await page.route('**/functions/v1/credit-analysis', route => route.abort('failed'))

      // Arrange
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      const toastMessage = page.getByText('Falha ao consultar análise de crédito')
      await expect(toastMessage).toBeVisible({ timeout: 15000 })
    })
  })
})