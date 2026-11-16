<script setup>
import { onMounted, ref } from 'vue'
import { TicketsDTO } from '@/Objets/TicketsDTO.js'
import { CollectionDTO } from '@/Objets/CollectionDTO.js'
import ApiTable from '@/components/ApiTable.vue'

const tickets = ref(null)
const title = ref('')
const status = ref('')
const priority = ref('')
const page = ref(1)
const loading = ref(false)
const error = ref('')
let activeFilters = {}
const statusLabels = { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu' }
const priorityLabels = { low: 'Basse', medium: 'Moyenne', high: 'Haute' }
const priorityColors = { low: 'text-bg-success', medium: 'text-bg-warning', high: 'text-bg-danger' }

async function loadTickets(targetPage = 1) {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const parameters = new URLSearchParams({ page: String(targetPage), ...activeFilters })
    const response = await fetch(import.meta.env.VITE_API_URL + '/tickets?' + parameters, {
      headers: { Accept: 'application/ld+json' },
    })
    if (!response.ok) throw new Error('Impossible de charger les tickets. Réessayez.')
    tickets.value = new CollectionDTO(await response.json(), (item) => new TicketsDTO(item))
    page.value = targetPage
  } catch (failure) {
    error.value = failure.message
  } finally {
    loading.value = false
  }
}

function searchTickets() {
  activeFilters = {}
  if (title.value.trim()) activeFilters.title = title.value.trim()
  if (status.value) activeFilters.status = status.value
  if (priority.value) activeFilters.priority = priority.value
  loadTickets(1)
}

function resetFilters() {
  title.value = ''
  status.value = ''
  priority.value = ''
  searchTickets()
}

onMounted(() => loadTickets())
</script>

<template>
  <h1 class="h2 mb-2">Tableau de bord</h1>
  <p class="text-secondary mb-4">Recherchez et suivez les anomalies de votre projet.</p>
  <form class="card card-body shadow-sm mb-4" @submit.prevent="searchTickets">
    <fieldset :disabled="loading" class="row g-3 align-items-end">
      <div class="col-12 col-md-6">
        <label class="form-label" for="filter-title">Titre</label>
        <input id="filter-title" v-model="title" class="form-control" type="search" placeholder="Rechercher un ticket" />
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label" for="filter-status">Statut</label>
        <select id="filter-status" v-model="status" class="form-select">
          <option value="">Tous les statuts</option>
          <option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label" for="filter-priority">Priorité</label>
        <select id="filter-priority" v-model="priority" class="form-select">
          <option value="">Toutes les priorités</option>
          <option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div class="col-12 d-flex gap-2">
        <button type="submit" class="btn btn-primary">Rechercher</button>
        <button type="button" class="btn btn-outline-secondary" @click="resetFilters">Réinitialiser</button>
      </div>
    </fieldset>
  </form>
  <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
  <p v-if="loading" role="status">Chargement des tickets…</p>
  <section v-else-if="tickets" class="card shadow-sm">
    <div class="card-body">
      <p class="text-secondary">{{ tickets.total }} ticket(s) trouvé(s)</p>
      <ApiTable :collection="tickets">
        <template #table-header>
          <th scope="col">Titre</th>
          <th scope="col">Statut</th>
          <th scope="col">Priorité</th>
          <th scope="col">Création</th>
          <th scope="col">Action</th>
        </template>
        <template #table-body="{ item }">
          <td class="text-break">{{ item.title }}</td>
          <td>{{ statusLabels[item.status] || item.status }}</td>
          <td><span class="badge" :class="priorityColors[item.priority]">{{ priorityLabels[item.priority] || item.priority }}</span></td>
          <td class="text-nowrap">{{ item.formattedDate }}</td>
          <td><RouterLink class="btn btn-sm btn-outline-primary text-nowrap" :to="{ name: 'detail', params: { id: item.id } }">Voir les détails</RouterLink></td>
        </template>
      </ApiTable>
      <nav class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3" aria-label="Pagination des tickets">
        <button class="btn btn-outline-primary" :disabled="loading || !tickets.hasPreviousPage" @click="loadTickets(page - 1)">Précédente</button>
        <span>Page {{ page }}</span>
        <button class="btn btn-outline-primary" :disabled="loading || !tickets.hasNextPage" @click="loadTickets(page + 1)">Suivante</button>
      </nav>
    </div>
  </section>
</template>
