<template>
  <div id="view-wago">
    <!-- BUILDER FRAME -->
    <div id="wago-builder-container" class="wago-container">
      <div id="wago-builder">
        <build-notes :scratch="true"></build-notes>
      </div>
    </div>
  </div>
</template>

<script>
import EditEncounterNotes from '../UI/EditEncounterNotes.vue'
export default {
  components: {
    'build-notes': EditEncounterNotes
  },
  created () {
    this.$store.commit('setWago', {
      code: {
        text: '',
        changelog: {}
      },
      versions: {
        versions: [{versionString: '1.0.0'}]
      }
    })
  }
}
</script>
