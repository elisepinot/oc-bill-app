/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import router from '../app/Router'
import Bills from '../containers/Bills.js'
import userEvent from '@testing-library/user-event'

//Given = postulat, When = action, Then = resultat attendu
describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      //Object.defineProperty : sert à attribuer une nouvelle propriété à un objet
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
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //Je m'attends à ce que windowIcon ait la classe active-icon (expect manquant --> ajouté OK)
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

//Test d'intégration GET
describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to Bills', () => {
    test('Then  bills should be fetched from mock API (GET method)', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'e@e' })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      //onNavigate permet de simuler le comportement de la navigation entre les pages de l'application.
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Création d'un nouvel objet Bills avec les dépendances mockées
      const mockedBills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      // Récupération des factures
      const bills = await mockedBills.getBills()
      // Vérification que la liste des factures n'est pas vide
      expect(bills.length > 0).toBeTruthy()
    })
  })
  describe('When an error occurs on API', () => {
    beforeEach(() => {
      //Utilisation de Jest pour "espionner" la méthode bills du mockStore -> permet de surveiller les appels à cette méthode et de remplacer son comportement par une implémentation mockée dans les tests.
      jest.spyOn(mockStore, 'bills')
      //Remplace l'objet localStorage du navigateur par un objet mocké
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'e@e',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })
    test('Then fetching bills from an API fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      //L'interface utilisateur (BillsUI) est censée afficher un message d'erreur correspondant à cette erreur 404.
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' })
      //Assure que toutes les tâches de rendu asynchrones sont terminées avant de continuer avec le test.
      await new Promise(process.nextTick)
      //Cette ligne utilise les outils de test pour rechercher un élément contenant le texte "Erreur 404" dans le DOM.
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test('fetching messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: 'Erreur 500' })
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

describe('Given I am a user connecter as en employee', () => {
  describe('When I click on the "Nouvelle note de frais" button on Bill page', () => {
    test('Then I should navigate to the NewBill page', () => {
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }
      const onNavigate = jest.fn()

      const mockedBills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      mockedBills.handleClickNewBill()

      // Vérifie que la méthode onNavigate a été appelée avec le bon chemin
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })
  describe('When I click on icon eye on Bill page', () => {
    test('Then it should open the bill modal', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )
      document.body.innerHTML = BillsUI({ data: bills })
      const myBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      $.fn.modal = jest.fn() //Permet de remplacer la méthode modal de jQuery par une fonction simulée fournie par Jest --> permet de contrôler son comportement dans les tests unitaires.

      const iconEye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(myBills.handleClickIconEye(iconEye))

      iconEye.addEventListener('click', handleClickIconEye())
      userEvent.click(iconEye)
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByText('Justificatif')).toBeTruthy()
    })
  })
})
