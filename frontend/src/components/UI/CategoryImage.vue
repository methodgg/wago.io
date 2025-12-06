<template>
  <div class="category-image">
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
    <img src="./../../assets/menu-zuldazar.png" v-if="group === 'zuldazar'"/>
    <img src="./../../assets/menu-cruciblestorms.png" v-if="group === 'crucible'"/>
    <img src="./../../assets/menu-torghast.png" v-if="group === 'torghast'"/>
    <img src="./../../assets/menu-nathria.png" v-if="group === 'nathria'"/>
    <img src="./../../assets/menu-sanctumofdom.png" v-if="group === 'sanctumdom'"/>
    <img src="./../../assets/menu-nyalotha.png" v-if="group === 'nyalotha'"/>
    <img src="./../../assets/menu-eternalpalace.png" v-if="group === 'eternalpalace'"/>
    <img src="./../../assets/menu-uldir.png" v-if="group === 'uldir'"/>
    <img src="./../../assets/menu-antorus.png" v-if="group === 'antorus'"/>
    <img src="./../../assets/menu-tombofsarg.png" v-else-if="group === 'tombofsargeras'"/>
    <img src="./../../assets/menu-nighthold.png" v-else-if="group === 'nighthold'"/>
    <img src="./../../assets/menu-dungeon.png" v-else-if="group === 'dungeon'"/>
    <img src="./../../assets/menu-misc.png" v-else-if="group === 'misc'"/>
    <img src="./../../assets/menu-accessibility.png" v-else-if="group === 'accessibility'"/>
    <img src="./../../assets/menu-equip.png" v-else-if="group === 'equip' || group === 'rpitem'"/>
    <img src="./../../assets/menu-mechanics.png" v-else-if="group === 'mechanics'"/>
    <img src="./../../assets/menu-wpvp.png" v-else-if="group === 'pvp-world'"/>
    <img src="./../../assets/menu-roles.png" v-else-if="group === 'role'"/>
    <img src="./../../assets/menu-arenas.png" v-if="group === 'pvp-arena'"/>
    <img src="./../../assets/menu-battlegrounds.png" v-else-if="group === 'pvp-battleground'"/>
    <img src="./../../assets/menu-gathering.png" v-if="group === 'prof-gathering'"/>
    <img src="./../../assets/menu-crafting.png" v-else-if="group === 'prof-crafting'"/>
    <img src="./../../assets/menu-secondaryprof.png" v-else-if="group === 'prof-secondary'"/>
    <img src="./../../assets/menu-mdt.png" v-else-if="group === 'affixWeek'"/>
    <img src="./../../assets/menu-affixes.png" v-else-if="group === 'affixes'"/>
    <img src="./../../assets/menu-speed.png" v-else-if="group === 'speed'"/>
    <img src="./../../assets/menu-development.png" v-else-if="group === 'development'"/>
    <img src="./../../assets/menu-snippets.png" v-else-if="group === 'snippets'"/>
    <img src="./../../assets/menu-trialofvalor.png" v-else-if="group === 'trialofvalor'"/>
    <img src="./../../assets/menu-emeraldnightmare.png" v-else-if="group === 'emeraldnightmare'"/>
    <img src="./../../assets/menu-hellfirecitadel.png" v-else-if="group === 'hellfirecitadel'"/>

    <img src="./../../assets/menu-worldboss.png" v-else-if="group === 'worldboss'"/>
    <img src="./../../assets/menu-moltencore.png" v-else-if="group === 'moltencore'"/>
    <img src="./../../assets/menu-blackwinglair.png" v-else-if="group === 'blackwinglair'"/>
    <img src="./../../assets/menu-aq20.png" v-else-if="group === 'aq20'"/>
    <img src="./../../assets/menu-aq40.png" v-else-if="group === 'aq40'"/>
    <img src="./../../assets/menu-zulgurub.png" v-else-if="group === 'zulgurub'"/>
    <img src="./../../assets/menu-naxxramas.png" v-else-if="group === 'naxxramas'"/>

    <img src="./../../assets/menu-ssc.png" v-else-if="group === 'ssc'"/>
    <img src="./../../assets/menu-tk.png" v-else-if="group === 'tk'"/>
    <img src="./../../assets/menu-mthyjal.png" v-else-if="group === 'mthyjal'"/>
    <img src="./../../assets/menu-bt.png" v-else-if="group === 'blacktemple'"/>
    <img src="./../../assets/menu-sw.png" v-else-if="group === 'sunwell'"/>
    <img src="./../../assets/menu-kara.png" v-else-if="group === 'karazhan'"/>
    <img src="./../../assets/menu-gruul.png" v-else-if="group === 'gruul'"/>
    <img src="./../../assets/menu-dungeontbc.png" v-else-if="group === 'dungeontbc'"/>

    <img src="./../../assets/menu-vuhdo.png" v-else-if="group === 'vuhdo'"/>
    <img src="./../../assets/menu-plater.png" v-else-if="group === 'plater'"/>
    <img src="./../../assets/menu-opie.png" v-else-if="group === 'opie'"/>
    <img src="./../../assets/menu-encounternotes.png" v-else-if="group === 'encounternotes'"/>
    <img src="./../../assets/menu-trpcamp.png" v-else-if="group === 'rpcampaign'"/>
    <img src="./../../assets/menu-lang.png" v-else-if="group === 'rplang'"/>
    <img src="./../../assets/menu-collection.png" v-else-if="group === 't-collection'"/>

    <img src="./../../assets/new-addon.png" v-else-if="group === 'new-addon'"/>
    <img src="./../../assets/weakauras.png" v-else-if="group === 't-weakaura'"/>
    <img src="./../../assets/weakauras.png" v-else-if="group === 't-classic-weakaura'"/>
    <img src="./../../assets/weakauralogo.png" v-else-if="group === 't-weakaura-nobg'"/>
    <img src="./../../assets/tukui.png" v-else-if="group === 't-elvui'"/>
    <img src="./../../assets/mdt.png" v-else-if="group === 't-mdt'"/>
    <img src="./../../assets/menu-cell.png" v-else-if="group === 't-cell'"/>
    <img src="./../../assets/menu-opie.png" v-else-if="group === 't-opie'"/>
    <img src="./../../assets/menu-vuhdo.png" v-else-if="group === 't-vuhdo'"/>
    <img src="./../../assets/menu-trpcamp.png" v-else-if="group === 't-totalrp' || group === 't-totalrp3'"/>
    <img src="./../../assets/menu-blizzhud.png" v-else-if="group === 't-blizzhud' || group === 't-cooldown-manager'"/>
    <img src="./../../assets/menu-plater.png" v-else-if="group === 't-plater'"/>
    <img src="./../../assets/menu-bigwigs.png" v-else-if="group === 't-bigwigs'"/>
    <img src="./../../assets/menu-macro.png" v-else-if="group === 't-macro'"/>
    <img src="./../../assets/macro-search.png" v-else-if="group === 't-macro-search'"/>
    <img src="./../../assets/menu-encounternotes.png" v-else-if="group === 't-encounternotes'"/>
    <img src="./../../assets/menu-gse.png" v-else-if="group === 't-gse'"/>

    <img src="./../../assets/df-toggle.svg" v-else-if="group === 'exp-df'"/>
    <img src="./../../assets/wotlk-toggle.svg" v-else-if="group === 'exp-wotlk'"/>
    <img src="./../../assets/classic-toggle.svg" v-else-if="group === 'exp-classic'"/>

    <img src="./../../assets/fellowship-logo.svg" v-else-if="group === 't-fellowship-ui'"/>
  </div>
</template>

<script>
export default {
  props: ['group']
}
</script>

<style>

</style>

