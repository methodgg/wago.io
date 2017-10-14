<template>
  <div>    
    <img src="./../../assets/menu-warrior.png" v-if="group === 'cl-warrior'"/>
    <img src="./../../assets/menu-paladin.png" v-else-if="group === 'cl-paladin'"/>
    <img src="./../../assets/menu-hunter.png" v-else-if="group === 'cl-hunter'"/>
    <img src="./../../assets/menu-rogue.png" v-else-if="group === 'cl-rogue'"/>
    <img src="./../../assets/menu-priest.png" v-else-if="group === 'cl-priest'"/>
    <img src="./../../assets/menu-deathknight.png" v-else-if="group === 'cl-deathknight'"/>
    <img src="./../../assets/menu-shaman.png" v-else-if="group === 'cl-shaman'"/>
    <img src="./../../assets/menu-mage.png" v-else-if="group === 'cl-mage'"/>
    <img src="./../../assets/menu-warlock.png" v-else-if="group === 'cl-warlock'"/>
    <img src="./../../assets/menu-monk.png" v-else-if="group === 'cl-monk'"/>
    <img src="./../../assets/menu-druid.png" v-else-if="group === 'cl-druid'"/>
    <img src="./../../assets/menu-demonhunter.png" v-else-if="group === 'cl-demonhunter'"/>
    <img src="./../../assets/menu-antorus.png" v-if="group === 'antorus'"/>
    <img src="./../../assets/menu-tombofsarg.png" v-else-if="group === 'tombofsargeras'"/>
    <img src="./../../assets/menu-nighthold.png" v-else-if="group === 'nighthold'"/>
    <img src="./../../assets/menu-dungeon.png" v-else-if="group === 'dungeon'"/>
    <img src="./../../assets/menu-misc.png" v-else-if="group === 'misc'"/>
    <img src="./../../assets/menu-equip.png" v-else-if="group === 'equip'"/>
    <img src="./../../assets/menu-mechanics.png" v-else-if="group === 'mechanics'"/>
    <img src="./../../assets/menu-wpvp.png" v-else-if="group === 'pvp-world'"/>
    <img src="./../../assets/menu-roles.png" v-else-if="group === 'role'"/>
    <img src="./../../assets/menu-bg.png" v-if="group === 'pvp-arena'"/>
    <img src="./../../assets/menu-arena.png" v-else-if="group === 'pvp-battleground'"/>
    <img src="./../../assets/menu-gathering.png" v-if="group === 'prof-gathering'"/>
    <img src="./../../assets/menu-crafting.png" v-else-if="group === 'prof-crafting'"/>
    <img src="./../../assets/menu-secondaryprof.png" v-else-if="group === 'prof-secondary'"/>
    <img src="./../../assets/menu-development.png" v-else-if="group === 'development'"/>
    <img src="./../../assets/menu-snippets.png" v-else-if="group === 'snippets'"/>
    <img src="./../../assets/menu-trialofvalor.png" v-else-if="group === 'trialofvalor'"/>
    <img src="./../../assets/menu-emeraldnightmare.png" v-else-if="group === 'emeraldnightmare'"/>
    <img src="./../../assets/menu-hellfirecitadel.png" v-else-if="group === 'hellfirecitadel'"/>
    <img src="./../../assets/menu-vuhdo.png" v-else-if="group === 'vuhdo'"/>

    <img src="./../../assets/weakauras.png" v-else-if="group === 't-weakaura'"/>
    <img src="./../../assets/tukui.png" v-else-if="group === 't-elvui'"/>
    <img src="./../../assets/menu-vuhdo.png" v-else-if="group === 't-vuhdo'"/>
  </div>
</template>

<script>
export default {
  props: ['group']
}
</script>

<style>

</style>

