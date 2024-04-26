/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import mockStore from '../__mocks__/store'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import router from '../app/Router'
import { localStorageMock } from '../__mocks__/localStorage.js'

// describe('Given I am connected as an employee', () => {
//   describe('When I am on NewBill Page', () => {
//     test('Then ...', () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html
//       //to-do write assertion
//     })
//   })
// })

describe('Given I am a connected user on the NewBill page', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
    )
    const root = document.createElement('div')
    root.setAttribute('id', 'root')
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
  })

  test('Then the form to create a new bill should be there', async () => {
    const formNewBill = await screen.findByTestId('form-new-bill')
    expect(formNewBill).toBeTruthy()
  })
  test('Then mail icon in vertical layout should be highlighted', async () => {
    // await waitFor(() => screen.getByTestId('icon-mail'))
    const mailIcon = await screen.getByTestId('icon-mail')
    expect(mailIcon.classList.contains('active-icon')).toBeTruthy()
  })
})

describe('Given I am a connected user on the NewBill page', () => {
  describe('When I submit the form with valid data', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    test('Then the new bill is added successfully via the POST route and I am redirected to the Bills page', async () => {
      // Mock pour les données du formulaire
      const mockFormData = {
        type: 'Services en ligne',
        name: 'Test bill',
        amount: 500,
        date: '2024-04-15',
        vat: '20',
        pct: '20',
        commentary: 'Test bill commentary',
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      }

      // Mock de la fonction create du store
      mockStore.bills().create = jest.fn(() =>
        Promise.resolve({
          fileUrl: 'https://localhost:3456/images/test.jpg',
          key: '1234',
        })
      )

      // Création d'un nouvel objet NewBill avec les dépendances mockées
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      })

      // Sélection du formulaire
      const formNewBill = await screen.getByTestId('form-new-bill')

      // Remplissage du formulaire avec les données mockées
      const typeInput = formNewBill.querySelector(
        `[data-testid="expense-type"]`
      )
      fireEvent.change(typeInput, { target: { value: mockFormData.type } })

      const nameInput = formNewBill.querySelector(
        `[data-testid="expense-name"]`
      )
      fireEvent.change(nameInput, { target: { value: mockFormData.name } })

      const amountInput = formNewBill.querySelector(`[data-testid="amount"]`)
      fireEvent.change(amountInput, { target: { value: mockFormData.amount } })

      const dateInput = formNewBill.querySelector(`[data-testid="datepicker"]`)
      fireEvent.change(dateInput, { target: { value: mockFormData.date } })

      const vatInput = formNewBill.querySelector(`[data-testid="vat"]`)
      fireEvent.change(vatInput, { target: { value: mockFormData.vat } })

      const pctInput = formNewBill.querySelector(`[data-testid="pct"]`)
      fireEvent.change(pctInput, { target: { value: mockFormData.pct } })

      const commentaryInput = formNewBill.querySelector(
        `[data-testid="commentary"]`
      )
      fireEvent.change(commentaryInput, {
        target: { value: mockFormData.commentary },
      })

      // Ajout du fichier
      const fileInput = formNewBill.querySelector(`[data-testid="file"]`)
      fireEvent.change(fileInput, { target: { files: [mockFormData.file] } })

      // Soumission du formulaire
      fireEvent.submit(formNewBill)

      // Vérification que la fonction create du store a été appelée avec les bonnes données
      expect(mockStore.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData), // Vérification que les données envoyées sont de type FormData
        headers: { noContentType: true }, // Utilisation de l'en-tête noContentType pour empêcher le contenu-type d'être automatiquement défini
      })
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
    })
  })
})
