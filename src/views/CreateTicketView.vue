<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TicketsDTO } from '@/Objets/TicketsDTO.js'

const router = useRouter()
const title = ref('')
const description = ref('')
const priority = ref('medium')
const saving = ref(false)
const error = ref('')

async function addTicket() {
  if (saving.value) return
  error.value = ''
  if (title.value.trim().length < 3 || title.value.trim().length > 255 || description.value.trim().length < 15) {
    error.value = 'Le titre doit contenir entre 3 et 255 caractères et la description au moins 15 caractères.'
    return
  }
  saving.value = true
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/tickets', {
      method: 'POST',
      headers: { Accept: 'application/ld+json', 'Content-Type': 'application/ld+json' },
      body: JSON.stringify({ title: title.value.trim(), description: description.value.trim(), priority: priority.value }),
    })
    if (!response.ok) throw new Error('Impossible de créer le ticket. Vérifiez les champs et réessayez.')
    const ticket = new TicketsDTO(await response.json())
    await router.push({ name: 'detail', params: { id: ticket.id } })
  } catch (failure) {
    error.value = failure.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="card shadow-sm mx-auto" style="max-width: 760px">
    <div class="card-body p-4">
      <h1 class="h3 mb-4">Créer un ticket</h1>
      <p v-if="error" class="alert alert-danger" role="alert">{{ error }}</p>
      <form @submit.prevent="addTicket">
        <fieldset :disabled="saving">
          <div class="mb-3">
            <label for="ticket-title" class="form-label">Titre</label>
            <input id="ticket-title" v-model="title" class="form-control" required minlength="3" maxlength="255" />
          </div>
          <div class="mb-3">
            <label for="ticket-description" class="form-label">Description</label>
            <textarea id="ticket-description" v-model="description" class="form-control" rows="6" required minlength="15"></textarea>
            <div class="form-text">Décrivez l'anomalie en au moins 15 caractères.</div>
          </div>
          <div class="mb-4">
            <label for="ticket-priority" class="form-label">Priorité</label>
            <select id="ticket-priority" v-model="priority" class="form-select" required>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-primary" type="submit">{{ saving ? 'Création en cours…' : 'Créer le ticket' }}</button>
            <RouterLink class="btn btn-outline-secondary" to="/">Retour à la liste</RouterLink>
          </div>
        </fieldset>
      </form>
    </div>
  </section>
</template>
