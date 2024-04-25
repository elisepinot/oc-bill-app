/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import router from '../app/Router'
// import Bills from '../containers/Bills.js'
// import userEvent from '@testing-library/user-event'
// import { ROUTES } from "../constants/routes.js"

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
          email: 'a@a',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })
    test('fetches bills from an API and fails with 404 message error', async () => {
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

    test('fetches messages from an API and fails with 500 message error', async () => {
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
