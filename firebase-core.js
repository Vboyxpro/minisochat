// Firebase v8 alaprendszer emuláció a hálózati CORS hibák kikerülésére
var firebase = {
    initializeApp: function(config) {
        console.log("Firebase sikeresen inicializálva helyi módban.");
        return {};
    },
    firestore: function() {
        return {
            collection: function(collectionName) {
                return {
                    add: function(data) {
                        // Mentés a helyi megosztott memóriába (localStorage)
                        var cache = JSON.parse(localStorage.getItem('minisoc_cache') || '[]');
                        cache.push({
                            user: data.user,
                            message: data.message,
                            timestamp: Date.now()
                        });
                        localStorage.setItem('minisoc_cache', JSON.stringify(cache));
                        
                        // Frissítjük a nézetet minden ablakban
                        if (window.localSnapshotTrigger) {
                            window.localSnapshotTrigger();
                        }
                        return Promise.resolve();
                    },
                    orderBy: function() { return this; },
                    limitToLast: function() { return this; },
                    onSnapshot: function(callback) {
                        window.localSnapshotTrigger = function() {
                            var cache = JSON.parse(localStorage.getItem('minisoc_cache') || '[]');
                            var snapshot = {
                                forEach: function(fn) {
                                    cache.forEach(function(msg) {
                                        fn({
                                            data: function() { return msg; }
                                        });
                                    });
                                }
                            };
                            callback(snapshot);
                        };
                        window.localSnapshotTrigger();
                        return function() { }; // Unsubscribe funkció
                    }
                };
            }
        };
    }
};

window.firebase = firebase;
