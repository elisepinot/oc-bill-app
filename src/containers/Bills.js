import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

//   getBills = () => {
//     if (this.store) {
//       return this.store
//       .bills()
//       .list()
//       .then(snapshot => {
//         console.log("Avant le tri:", snapshot);
//         const bills = snapshot
//           .map(doc => {
//             try {
//               return {
//                 ...doc,
//                 date: formatDate(doc.date),
//                 status: formatStatus(doc.status)
//               }
//             } catch(e) {
//               // if for some reason, corrupted data was introduced, we manage here failing formatDate function
//               // log the error and return unformatted date in that case
//               console.log(e,'for',doc)
//               return {
//                 ...doc,
//                 date: doc.date,
//                 status: formatStatus(doc.status)
//               }
//             }
//           })
//           .sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par date décroissante
//           console.log("Après le tri:", bills);
//           console.log(new Date("2021-03-19"));
//           console.log(new Date("2021-03-19T12:00:00Z"));
//           console.log('length', bills.length)
//         return bills
//       })
//     }
//   }
// }

getBills = () => {
  if (this.store) {
    return this.store
      .bills()
      .list()
      .then(snapshot => { // traite les données récupérées une fois la promesse résolue. snapshot contient les données des factures sous forme brute, telles qu'elles sont retournées par la méthode list().
        const bills = snapshot
          .map(doc => ({ //transforme chaque élément de 'snapshot'
            ...doc, //opérateur de décomposition. Copie les propriétés existantes de chaque facture dans un nouvel objet
            date: new Date(doc.date) // Création d'un nouvel objet Date à partir de la string 'date' de chaque facture, pour permettre le tri des dates
          }))
          .sort((a, b) => b.date - a.date) // Ajout du tri par ordre décroissant 
          .map(doc => ({
            ...doc,
            date: formatDate(doc.date) // Conversion de la date en string après le tri seulement --> plus lisible pour l'utilisateur final
          }));
        return bills;
      })
  }
}}



