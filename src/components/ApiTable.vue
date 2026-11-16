<script setup>
import { CollectionDTO } from '@/Objets/CollectionDTO.js'

defineProps({ collection: { type: CollectionDTO, default: null } })
</script>

<template>
  <div v-if="collection && collection.items.length" class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr>
          <slot name="table-header"></slot>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in collection.items" :key="item.id">
          <slot name="table-body" :item="item"></slot>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-secondary text-center py-4" role="status">
    Aucun résultat pour cette recherche.
  </p>
</template>
