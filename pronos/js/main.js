/** Team logo path */
var _formatDate = function(date) {
  var d = date;
  d = d.replace('/01/', ' Janvier ');
  d = d.replace('/02/', ' Février ');
  d = d.replace('/03/', ' Mars ');
  d = d.replace('/04/', ' Avril ');
  d = d.replace('/05/', ' Mai ');
  d = d.replace('/06/', ' Juin ');
  d = d.replace('/07/', ' Juillet ');
  d = d.replace('/08/', ' Août ');
  d = d.replace('/09/', ' Septembre ');
  d = d.replace('/10/', ' Octobre ');
  d = d.replace('/11/', ' Novembre ');
  d = d.replace('/12/', ' Décembre ');
  return d;
};

/** Format date dd/mm/yyyy to french*/
var _teamLogo = function(team) {
  return 'img/' + escape(team.replace('è','e').replace('ç','c')) + '.png';
};

Vue.component('team-score', {
  template: '#tscore-template',
  props: ['score']
});

var resultsComponent = Vue.component('game-results', {
  template: '#results-template',
  props: ['game'],
  methods: {
    formatDate: _formatDate,
    teamLogo: _teamLogo
  }
});

var pronoComponent = Vue.component('game-prono', {
  template: '#prono-template',
  props: ['prono', 'game', 'updating'],
  data: function () {
    return {}
  },
  computed: {},
  filters: {},
  methods: {
    teamLogo: _teamLogo ,
    formatDate: _formatDate,
    /** Compute the points taken by the player*/
    pointsTaken: function(date, playerData) {
      return '';
    }
  }
});


// bootstrap the demo
var demo = new Vue({
  el: '#content',
  data: {
    games: null,
    loading: true,
    updating: false,
    playerNames: null,
    playerName: null,
    playerData: null,
    scores: []
  },
  created: function () {
    DATA.loadData(function(errLoad){
      if(errLoad) {
        console.error(errLoad);
        return;
      }
      this.games = DATA.games;
      this.playerNames = DATA.playerNames;
      this.loading = false;
      // calcul des scores
      console.log('calcul')
      for (var p = 0; p < this.playerNames.length; p++) {
        this.scores[this.playerNames[p]] = 0;  
      }
      for (var g = 0; g < this.games.length; g++) {
        var game = this.games[g];
        if (game.score1) {
          var bo1 = game.bo1;
          var bo2 = game.bo2;
          var bd1 = game.score2 > game.score1 && (game.score2 - game.score1) < 6;
          var bd2 = game.score1 > game.score2 && (game.score1 - game.score2) < 6;
          for (var p = 0; p < this.playerNames.length; p++) {
            var prono = DATA.playerDatas[this.playerNames[p]].games && DATA.playerDatas[this.playerNames[p]].games[game.id];
            if(!prono || (prono.score1 + prono.score2) === 0 ) continue;
            var p_bd1 = prono.score2 > prono.score1 && (prono.score2 - prono.score1) < 6;
            var p_bd2 = prono.score1 > prono.score2 && (prono.score1 - prono.score2) < 6; 
            if (game.bo1 && prono.bo1) this.scores[this.playerNames[p]]++;
            if (game.bo2 && prono.bo2) this.scores[this.playerNames[p]]++;
            if (bd1 && p_bd1) this.scores[this.playerNames[p]]++;
            if (bd2 && p_bd2) this.scores[this.playerNames[p]]++;
          }
        }
        
      }
    }.bind(this));
  },
  methods: {
    loadRanking: function() {
      this.updating = false;
      this.playerName = null;
      this.playerData = null;
    },
    loadPlayer: function(name) {
      this.updating = false;
      this.playerName = name;
      this.playerData = DATA.playerDatas[name] || {};
      if(!this.playerData.games) { this.playerData.games = {}; }
      if(!this.playerData.name) { this.playerData.name = name; }
      for(var g = 0; g < this.games.length; g++) {
        var gameId = this.games[g].id
        if (!this.playerData.games[gameId]) {
          this.playerData.games[gameId] = {
             score1: 0,
              score2: 0,
              bo1: false,
              bo2: false,
          }
        }
      }
      return true;
    },
    startUpdating: function() {
      this.updating = true;
    },
    save: function() {
      DATA.saveData(this.playerName, this.playerData, function(errSave) {
        if (errSave) { console.error(errSave); return; }
        this.updating = false;
      }.bind(this));
    },
    playerScore: function (playerName) {
      return this.scores[playerName] || 0;
    }
  }
})