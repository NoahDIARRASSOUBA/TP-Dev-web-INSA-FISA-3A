<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TicketsDTO } from '@/Objets/TicketsDTO.js'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const confirmDelete = ref(false)
const ticket = ref(null)
const status = ref('open')
const priority = ref('medium')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const statusLabels = { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu' }
const priorityLabels = { low: 'Basse', medium: 'Moyenne', high: 'Haute' }
const priorityColors = { low: 'text-bg-success', medium: 'text-bg-warning', high: 'text-bg-danger' }

watch(
  () => props.id,
  async (id, previousId, onCleanup) => {
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    loading.value = true
    ticket.value = null
    error.value = ''
    success.value = ''
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/tickets/' + id, {
        headers: { Accept: 'application/ld+json' },
        signal: controller.signal,
      })
      if (!response.ok)
        throw new Error(
          response.status === 404
            ? 'Ce ticket est introuvable.'
            : 'Impossible de charger ce ticket.',
        )
      ticket.value = new TicketsDTO(await response.json())
      status.value = ticket.value.status
      priority.value = ticket.value.priority
    } catch (failure) {
      if (failure.name !== 'AbortError') error.value = failure.message
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  },
  { immediate: true },
)

async function saveTicket() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/tickets/' + props.id, {
      method: 'PATCH',
      headers: { Accept: 'application/ld+json', 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify({ status: status.value, priority: priority.value }),
    })
    if (!response.ok) throw new Error('Impossible de modifier ce ticket. Réessayez.')
    ticket.value = new TicketsDTO(await response.json())
    status.value = ticket.value.status
    priority.value = ticket.value.priority
    success.value = 'Modifications enregistrées.'
  } catch (failure) {
    error.value = failure.message
  } finally {
    saving.value = false
  }
}
async function deleteTicket() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/tickets/' + props.id, {
      method: 'DELETE',
    })
    if (response.status !== 204) throw new Error('Impossible de supprimer ce ticket. Réessayez.')
    await router.push({ name: 'dashboard' })
  } catch (failure) {
    error.value = failure.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <RouterLink class="btn btn-outline-secondary mb-3" to="/">Retour à la liste</RouterLink>
  <p v-if="loading" role="status">Chargement du ticket…</p>
  <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
  <p v-if="success" class="alert alert-success" role="status">{{ success }}</p>
  <article v-if="ticket && !loading" class="card shadow-sm">
    <div class="card-body p-4">
      <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
        <span class="text-secondary">Ticket n°{{ ticket.id }}</span>
        <span class="badge" :class="priorityColors[ticket.priority]">{{
          priorityLabels[ticket.priority]
        }}</span>
        <span class="badge text-bg-secondary">{{ statusLabels[ticket.status] }}</span>
      </div>
      <h1 class="h3 text-break">{{ ticket.title }}</h1>
      <p class="text-secondary">Créé le {{ ticket.formattedDate }}</p>
      <p class="text-break mb-4" style="white-space: pre-wrap">{{ ticket.description }}</p>
      <h2 class="h5">Mettre à jour le ticket</h2>
      <form @submit.prevent="saveTicket">
        <fieldset :disabled="saving" class="row g-3">
          <div class="col-12 col-md-6">
            <label for="edit-status" class="form-label">Statut</label>
            <select id="edit-status" v-model="status" class="form-select" required>
              <option v-for="(label, value) in statusLabels" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label for="edit-priority" class="form-label">Priorité</label>
            <select id="edit-priority" v-model="priority" class="form-select" required>
              <option v-for="(label, value) in priorityLabels" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="col-12">
            <button class="btn btn-primary" type="submit">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </fieldset>
      </form>
      <div class="border-top mt-4 pt-3">
        <button
          v-if="!confirmDelete"
          class="btn btn-outline-danger"
          :disabled="saving"
          @click="confirmDelete = true"
        >
          Supprimer le ticket
        </button>
        <div v-else class="alert alert-warning mb-0" role="alert">
          <p>
            Supprimer définitivement le ticket n°{{ ticket.id }} ? Cette action est irréversible.
          </p>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-danger" :disabled="saving" @click="deleteTicket">
              {{ saving ? 'Suppression…' : 'Confirmer la suppression' }}
            </button>
            <button
              class="btn btn-outline-secondary"
              :disabled="saving"
              @click="confirmDelete = false"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
