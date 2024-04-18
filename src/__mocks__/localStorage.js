export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return JSON.stringify(store[key])
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key) {
      delete store[key]
    }
  }
})()

// Fournit une implémentation factice de l'interface 'localStorage' du navigateur. Cette simulation est souvent utilisée dans les tests pour éviter la dépendance au stockage réel du navigateur, permettant ainsi aux tests de s'exécuter de manière isolée et prévisible.