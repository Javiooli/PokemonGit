import { PokemonTeamViewModel } from "../viewModel.js";
import PokemonCard from "./PokemonCard.js";

export const App = {
  components: {
    "pokemon-card": PokemonCard,
  },
  template: /*html*/ `
  <div>
  <section v-if="currentScreen === 'setup'" class="player-setup-section">
      <h2 class="setup-title">Configuració dels Jugadors</h2>
      <p class="setup-instruccions">
          Introdueix els noms dels jugadors per començar el joc.
      </p>
  
      <div class="toggle-container">
          <label for="two-players-toggle">Dos Jugadors:</label>
          <label class="switch">
          <input type="checkbox" v-model="isTwoPlayers" />
          <span class="slider round"></span>
          </label>
      </div>
  
      <div class="player-input-group">
          <label for="player1-name" class="player-label">Nom del Jugador 1:</label>
          <input type="text" v-model="player1Name" class="player-input" required />
      </div>
  
      <div class="player-input-group" v-if="isTwoPlayers">
          <label for="player2-name" class="player-label">Nom del Jugador 2:</label>
          <input type="text" v-model="player2Name" class="player-input" required />
      </div>
  
      <button @click="startGame" class="setup-button">Següent</button>
  </section>
        <!-- Secció de selecció de l'equip -->
  <section v-if="currentScreen === 'teamSelection'" id="team-selection-section">
      <h2>Selecciona el teu Equip</h2>
      <h2>{{ currentPlayerSelectionMessage }}</h2>        
      <h2 id="credits-display">
          Crèdits restants: <span id="credits-value">{{ creditsDisplay }}</span>
      </h2>
      <div id="team-section">
          <div id="selected-team-grid" class="grid-container" ref="teamContainer">
            <pokemon-card
            v-for="(poke, index) in currentPlayerTeam"
            :key="index"
            :pokemon="poke"
            :is-selected="isPokemonInTeam(poke.name)"
            @toggle-selection="handleToggleSelection"
            />
          </div>
      </div>

      <button id="next-player-button" style="display: block" @click="handleNextPlayer">
          {{ nextPlayerButtonContent }}
      </button>
      <!-- Opcions d'ordenació -->
      <div id="sort-options-section">
          <h2>Opcions d'Ordenació</h2>
          <form id="sort-options-form">
              <fieldset>
                  <legend>Ordena per:</legend>
                  <label>
                  <input type="radio" name="sort-criteria" value="name" v-model="sortCriteria" />
                  Nom
                  </label>
                  <label>
                  <input type="radio" name="sort-criteria" value="points" v-model="sortCriteria" />
                  Punts
                  </label>
                  <label>
                  <input type="radio" name="sort-criteria" value="type" v-model="sortCriteria" />
                  Tipus
                  </label>
              </fieldset>
              <fieldset>
                  <legend>Mètode d'ordenació:</legend>
                  <label>
                  <input type="radio" name="sort-method" value="bubble" v-model="sortMethod" />
                  Bombolla
                  </label>
                  <label>
                  <input type="radio" name="sort-method" value="insertion" v-model="sortMethod" />
                  Inserció
                  </label>
                  <label>
                  <input type="radio" name="sort-method" value="selection" v-model="sortMethod" />
                  Selecció
                  </label>
              </fieldset>
              <button type="button" id="sort-team" @click="handleSortOptions">
              Ordenar
              </button>
          </form>
      </div>
      <div id="pokemon-grid" class="grid-container" ref="gridContainer">
          <pokemon-card
          v-for="(poke, index) in globalPokemonList"
          :key="index"
          :pokemon="poke"
          :is-selected="isPokemonInTeam(poke.name)"
          @toggle-selection="handleToggleSelection"
          />
      </div>
  </section>

  <!-- Secció de batalla -->
  <section v-if="currentScreen === 'battle'" id="battle-section">
    <h2 id="current-turn-display">{{ currentTurnDisplay }}</h2>
    <div id="teams-overview-section">
      <div>
        <h2 id="player1-team-name">{{ player1Name }}</h2>
        <div id="player1-team-display" class="grid-container">
          <pokemon-card
            v-for="(poke, index) in player1Team"
            :key="index"
            :pokemon="poke"
            :is-selected="true"
            :inBattle="true"
          />
        </div>
      </div>
      <div>
        <h2 id="player2-team-name">{{ player2Name }}</h2>
        <div id="player2-team-display" class="grid-container">
          <pokemon-card
            v-for="(poke, index) in player2Team"
            :key="index"
            :pokemon="poke"
            :is-selected="true"
            :inBattle="true"
          />
        </div>
      </div>
    </div>
    <div id="battle-arena-section" style="display: flex;">
      <div id="battle-log-container">
        <h3>Registre de Batalla</h3>
        <ul id="battle-log">
          <li v-for="(log, index) in battleLog" :key="index">{{ log }}</li>
        </ul>
      </div>
    </div>
    <button id="start-battle-button" @click="startBattle" v-if="beforeBattle">Començar batalla!</button>
  </section>
</div>    
`,
  data() {
    return {
      currentScreen: "setup",
      isTwoPlayers: true,
      player1Name: "",
      player2Name: "",
      nextPlayerButtonContent: "Següent Jugador",
      currentPlayerSelectionMessage: "",
      currentPlayerSelectionDisplay: "",
      currentTurnDisplay: "",
      creditsDisplay: "",
      sortCriteria: "",
      sortMethod: "",
      globalPokemonList: [],
      currentPlayerTeam: [],
      player1Team: [],
      player2Team: [],
      showTeamList: [],
      battleLog: [],
      beforeBattle: true,
      viewModel: new PokemonTeamViewModel()  // Your PokemonTeamViewModel instance
    };
  },
  methods: {
    startGame() {
      if (!this.player1Name || (this.isTwoPlayers && !this.player2Name)) {
        alert("Si us plau, introdueix els noms de tots els jugadors.");
        return;
      }
      if (!this.isTwoPlayers) {
        this.player2Name = "CPU";
      }
      console.log(
        `Jugador 1: ${this.player1Name}, Jugador 2: ${this.player2Name}`
      );
      this.currentScreen = "teamSelection";
      this.startTeamSelection();
    },
    startTeamSelection() {
      // Call initializeMatch() on the ViewModel to set up players
      this.viewModel.initializeMatch(this.player1Name, this.player2Name);
      // Set up for Player 1's team selection
      //this.viewModel.currentPlayer = this.player1Name;
      this.currentPlayerSelectionMessage = `${this.player1Name}, selecciona el teu equip Pokémon`;
      this.renderGlobalList();
      this.updateCreditsDisplay();
    },
    // Exemple del mètode adaptat
    renderGlobalList() {
      // En lloc de manipular el DOM, actualitzem la propietat reactiva:
      this.globalPokemonList = this.viewModel.getGlobalList();
      // Això farà que Vue re-renderitzi la graella amb la nova llista.
    },
    renderSelectionTeam() {
      this.currentPlayerTeam = this.viewModel.currentPlayer.getTeam();
    },
    handleNextPlayer() {
      // Check the current player and handle transitions.
      if (this.viewModel.currentPlayer === this.viewModel.player1) {
        // Player 1 finished selecting their team.
        if (this.isTwoPlayers) {
          //
          // Two-player mode: move to Player 2.
          //this.viewModel.currentPlayer = this.player2Name;
          this.viewModel.switchPlayer(); // repetida??
          //const player2Name = this.viewModel.currentPlayer.getName(); // Fetch Player 2 name
          this.currentPlayerSelectionMessage = `${this.player2Name}, selecciona el teu Pokémon`;
          this.updateCurrentPlayerTeam(); //Falta traerlo del view.
          // Re-render for Player 2's team selection.
          this.renderGlobalList();
          this.updateCreditsDisplay();
          this.nextPlayerButtonContent = "Fi de la selecció d'equips";
        } else {
          // One player vs. CPU: automatically select a team for the CPU.
          this.viewModel.autoSelectCpuTeam();
          this.updateCurrentPlayerTeam();
          this.transitionToBattle();
        }
      } else if (this.viewModel.currentPlayer === this.viewModel.player2) {
        // Both players have selected their teams.
        this.transitionToBattle();
      }
    },
    updateCurrentPlayerTeam() {
      // En lloc de manipular el DOM, actualitzem la propietat reactiva:
      this.currentPlayerTeam = this.viewModel.getCurrentTeam();
      // Això farà que Vue re-renderitzi la graella amb la nova llista.
    },
    handleSortOptions() {
      console.log("Ordenar per:", this.sortCriteria);
      console.log("Mètode d'ordenació:", this.sortMethod);
      this.viewModel.sortGlobalList(this.sortCriteria, this.sortMethod);
      this.renderGlobalList();
    },
    updateCreditsDisplay() {
      this.creditsDisplay = `${this.viewModel
        .currentPlayer
        .getCredits()}`;
    },
    isPokemonInTeam(name) {
      const playerTeam =
        this.viewModel.currentPlayer.name === this.player1Name
          ? this.viewModel.player1.team
          : this.viewModel.player2.team;
      return playerTeam.selectedTeam.some((p) => p.name === name);
    },
    // Called from inside the parent when child emits `toggle-selection`
    handleToggleSelection(pokemon) {
      // If it's already in the team, remove it. Otherwise, try to add it.
      const isInTeam = this.isPokemonInTeam(pokemon.name);
      if (isInTeam) {
        this.viewModel.removePokemonFromTeam(pokemon.name);
      } else {
        const addResult =
          this.viewModel.addPokemonToCurrentPlayer(pokemon);
        if (!addResult) {
          alert("No es pot afegir el Pokémon.");
        }
      }

      // After adding/removing, refresh the player's team
      this.updateCurrentPlayerTeam();
      // Possibly update credits or other UI
      this.updateCreditsDisplay();
    },

    transitionToBattle() {
      this.currentScreen = "battle";
      this.currentTurnDisplay = `Comença la batalla: ${this.player1Name}!`;
      this.player1Team = this.viewModel.player1.team.selectedTeam;
      this.player2Team = this.viewModel.player2.team.selectedTeam;
      this.battleLog = [];
      this.battleLog.push(`Batalla iniciada entre ${this.player1Name} i ${this.player2Name}!`);
    },

    startBattle() {
      this.viewModel.startBattle((message) => this.addToBattleLog(message));
      this.beforeBattle = false;
    },

    addToBattleLog(message) {
      this.battleLog.push(message);
    },

    async fetchAndLoadPokemons() {
      try {
        console.log("Fetching from URL: ./pokemon_data.json");
        const response = await fetch("./pokemon_data.json");
        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }
        const data = await response.json();
        console.log("Data fetched:", data);
        this.viewModel.pokemonList.loadPokemons(data);
      } catch (error) {
        console.error("Error loading Pokémon data:", error);
      }
    },
  },
  // Altres mètodes...
  mounted() {
    this.fetchAndLoadPokemons();
  },
  updated() {
    const logUl = this.$el.querySelector("#battle-log");
    if (logUl)
      logUl.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
};
